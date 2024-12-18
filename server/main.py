from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import IsolationForest
import pickle
import os
from asyncpg.pool import create_pool

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DATABASE_URL = "postgresql://anomaly_data_owner:RhsgDvL9wP2U@ep-aged-cherry-a5zocusr.us-east-2.aws.neon.tech/anomaly_data?sslmode=require"

MODEL_FILE = "model.pkl"
MODEL_TRAINED_FLAG = "model_trained.flag"
BATCH_SIZE = 10

if not os.path.exists(MODEL_FILE):
    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    with open(MODEL_FILE, "wb") as f:
        pickle.dump(model, f)

class LoginData(BaseModel):
    typing_frequency_email: float
    typing_frequency_password: float
    keypress_duration_email: float
    keypress_duration_password: float
    mouse_or_tab: int
    field_interaction_time_mail: float
    field_interaction_time_password: float
    login_submission_time: float
    mouse_movement_pattern: int
    class Config:
        orm_mode = True

pool = None

@app.on_event("startup")
async def startup():
    global pool
    pool = await create_pool(DATABASE_URL)
    
@app.on_event("shutdown")
async def shutdown():
    await pool.close()

async def get_db_connection():
    return await pool.acquire()

async def release_db_connection(conn):
    await pool.release(conn)

async def fetch_training_data():
    try:
        conn = await get_db_connection()
        rows = await conn.fetch('''SELECT typing_frequency_email,typing_frequency_password, keypress_duration_email,keypress_duration_password, 
                             field_interaction_time_mail, field_interaction_time_password, 
                             login_submission_time, mouse_movement_pattern FROM anomaly_data''')
    
        data = np.array([[
            row['typing_frequency_email'],
            row['typing_frequency_password'],
            row['keypress_duration_email'],
            row['keypress_duration_password'],
            row['field_interaction_time_mail'],
            row['field_interaction_time_password'],
            row['login_submission_time'],
            row['mouse_movement_pattern']
        ] for row in rows])
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {e}")
    finally:
        await release_db_connection(conn)


@app.post("/model-reset")
async def reset_model():
    if os.path.exists(MODEL_FILE):
        os.remove(MODEL_FILE)
    if os.path.exists(MODEL_TRAINED_FLAG):
        os.remove(MODEL_TRAINED_FLAG)
    if not os.path.exists(MODEL_FILE):
        model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
        with open(MODEL_FILE, "wb") as f:
            pickle.dump(model, f)
    return {"reset_status" : "resetted_model"}
        
@app.post("/submit-data/")
async def submit_data(login_data: LoginData):
    try:
        conn = await get_db_connection()
        query = '''
            INSERT INTO anomaly_data (
                typing_frequency_email,typing_frequency_password, keypress_duration_email,keypress_duration_password,
                mouse_or_tab,field_interaction_time_mail,
                field_interaction_time_password, login_submission_time,
                mouse_movement_pattern
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;
        '''
        data_id = await conn.fetchval(query,
                                      login_data.typing_frequency_email,
                                      login_data.typing_frequency_password,
                                      login_data.keypress_duration_email,
                                      login_data.keypress_duration_password,
                                      login_data.mouse_or_tab,
                                      login_data.field_interaction_time_mail,
                                      login_data.field_interaction_time_password,
                                      login_data.login_submission_time,
                                      login_data.mouse_movement_pattern)

        if data_id >= BATCH_SIZE and data_id % BATCH_SIZE == 0:
            training_data = await fetch_training_data()
            model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
            print("Training Started!")
            model.fit(training_data)
            
            with open(MODEL_FILE, "wb") as f:
                pickle.dump(model, f)
            with open(MODEL_TRAINED_FLAG, 'w') as f:
                f.write("Model has been trained.")
            print("training done!")
        if(os.path.exists(MODEL_TRAINED_FLAG)):
            with open(MODEL_FILE, "rb") as f:
                model = pickle.load(f)

            input_data = np.array([[
                login_data.typing_frequency_email,
                login_data.typing_frequency_password,
                login_data.keypress_duration_email,
                login_data.keypress_duration_password,
                login_data.field_interaction_time_mail,
                login_data.field_interaction_time_password,
                login_data.login_submission_time,
                login_data.mouse_movement_pattern
            ]])

            prediction = model.predict(input_data)
            is_anomaly = str(prediction[0])

            return {"message": "Data submitted successfully", "is_anomaly": is_anomaly}
        else: return {
            "message": "Data submitted successfully",
            "is_anomaly": "0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving data: {e}")
    finally:
        await release_db_connection(conn)

@app.get("/health/")
async def health_check():
    return {"status": "Server is running"}

