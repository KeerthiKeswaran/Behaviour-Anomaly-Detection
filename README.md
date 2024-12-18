# Behavioural-Anomaly-Detection

## **Getting Started**

### **Prerequisites**

Make sure you have the following installed on your system:
- **Node.js** (v16 or higher)
- **Python** (v3.9 or higher)
- **pip** (Python package manager)
- **virtualenv** (Optional, for creating isolated Python environments)
- **Git**

---

## **Setup and Run Instructions**

### **Clone the Repository**
1. Clone the repository using the following command:
   ```bash
   git clone https://github.com/KeerthiKeswaran/Behavioural-Anomaly-Detection.git
   cd Behavioural-Anomaly-Detection
   ```

---

### **1. Backend Setup (Server)**

#### **Navigate to the Server Folder**
```bash
cd server
```

#### **Create a Virtual Environment (Optional but Recommended)**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### **Install Requirements**
```bash
pip install -r requirements.txt
```

#### **Run the Server**
```bash
uvicorn main:app --reload
```

- The backend will start at `http://127.0.0.1:8000`.
- You can access the FastAPI interactive docs at `http://127.0.0.1:8000/docs`.

---

### **2. Frontend Setup (Client)**

#### **Navigate to the Client Folder**
```bash
cd client
```

#### **Install Dependencies**
```bash
npm install
```

#### **Run the Client**
```bash
npm run dev
```

- The frontend will start at `http://127.0.0.1:5173`.

---

#You're now ready to use the software.

---


### **Behavioral Anomaly Detection SDK**

#### **Overview**

The Behavioral Anomaly Detection SDK is a specialized software development kit (SDK) designed to integrate behavioral anomaly detection into applications, primarily for use in security-critical systems like banking, e-commerce, or enterprise software. By analyzing user interaction patterns, the SDK helps detect unusual or fraudulent behavior during login and other sensitive operations. This is achieved using machine learning algorithms, specifically an Isolation Forest model.

---

#### **Core Features**

1. **User Behavior Analytics**  
   - Tracks various user interaction patterns, such as typing frequency, keypress duration, mouse movements, and tab key usage.
   - Monitors time spent on specific fields and overall submission time.

2. **Anomaly Detection**  
   - Uses an Isolation Forest model to classify input data as normal or anomalous.
   - Provides real-time predictions to identify suspicious or fraudulent behavior.

3. **Training and Retraining**  
   - Automatically retrains the model in batches when sufficient new data is collected.
   - Ensures the model adapts to evolving user behavior.

4. **Data Storage and Processing**  
   - Uses PostgreSQL to store behavioral data.
   - Processes data in batches for efficient model updates.

5. **FastAPI Integration**  
   - Provides a RESTful API for data submission, anomaly prediction, and model management.

---

#### **Technical Specifications**

- **Programming Language**: Python (Backend), TypeScript (Frontend Integration)  
- **Backend Framework**: FastAPI  
- **Frontend Framework**: React with TypeScript  
- **Database**: PostgreSQL  
- **Machine Learning Model**: Isolation Forest (sklearn.ensemble)  

---

#### **How It Works**

1. **Data Collection**:  
   Users' interaction data is collected via the frontend, including metrics such as:
   - Typing frequency (email/password fields)
   - Keypress duration
   - Field interaction times
   - Mouse movement patterns and tab key usage

2. **Data Submission**:  
   The collected data is sent to the backend via a POST request to the `/submit-data/` endpoint.

3. **Anomaly Detection**:  
   - If the Isolation Forest model is already trained, it predicts whether the submitted data is anomalous.
   - If the model requires retraining, the data is added to a batch and used to retrain the model once the batch size threshold is met.

4. **Model Training**:  
   - The model is retrained periodically when a set number of new data entries are submitted.
   - Trained models are stored using Pickle for reuse.

5. **Real-Time Predictions**:  
   The SDK provides real-time feedback on whether the behavior is anomalous, enabling immediate action by the client application.

---

#### **Endpoints**

1. **Health Check**  
   - **Endpoint**: `/health/`  
   - **Method**: GET  
   - **Purpose**: Verifies if the server is running.

2. **Data Submission**  
   - **Endpoint**: `/submit-data/`  
   - **Method**: POST  
   - **Input**: User interaction data (JSON payload)  
   - **Output**: Submission status and anomaly prediction.

3. **Model Reset**  
   - **Endpoint**: `/model-reset/`  
   - **Method**: POST  
   - **Purpose**: Resets the model to its default state.

---

#### **Integration Guide**

1. **Frontend Integration**  
   - Use the SDK's client library or create API calls to the backend endpoints for submitting user data and retrieving predictions.

2. **Backend Integration**  
   - Import the SDK as a dependency in Python applications.
   - Extend or customize the SDK to include additional features or adjust thresholds.

---

#### **Use Cases**

1. **Banking Applications**:  
   Detect unusual login behaviors to prevent unauthorized access.

2. **E-commerce Platforms**:  
   Identify fraudulent activities like bot-based login attempts or unusual purchase patterns.

3. **Enterprise Software**:  
   Monitor and flag unusual interactions in sensitive systems like employee portals.

---

#### **Advantages**

- **Real-Time Detection**: Provides immediate feedback on anomalies.  
- **Adaptability**: Continuously retrains itself with new data to adapt to changing behavior patterns.  
- **Ease of Integration**: Lightweight and RESTful API ensures quick integration into existing systems.  
- **Customizable**: Open-source flexibility for extending the SDK based on specific requirements.

---

#### **Limitations**

- Requires a consistent flow of data for effective anomaly detection.  
- The model's accuracy depends on the quality and variety of the training data.  
- May require fine-tuning of thresholds to reduce false positives or negatives.

---

#### **Future Enhancements**

1. **Integration with Advanced Models**:  
   Include deep learning models like LSTMs or Transformers for complex behavior analysis.

2. **Multi-Platform SDK**:  
   Expand support for mobile platforms (e.g., Android/iOS).

3. **Real-Time Visualization**:  
   Provide a dashboard for visualizing behavioral trends and anomaly patterns.

4. **Enhanced Security**:  
   Add encryption for all data exchanged between the frontend and backend.

5. **Plug-and-Play SDK**:  
   Package as an installable library (`pip` package) for direct use in Python applications.

---
### **Behavioral Anomaly Detection Data Schema**

This schema represents the structure of the `anomaly_data` table in a PostgreSQL database. The table is specifically designed to store user behavioral interaction metrics that are utilized for anomaly detection purposes.

---

### **Data Schema**

- **Table Name**: `public.anomaly_data`
- **Primary Key**: `id` (auto-incremented)

---

### **Attributes Breakdown**

| **Column Name**                 | **Type**          | **Description**                                                                                     |
|---------------------------------|-------------------|-----------------------------------------------------------------------------------------------------|
| `id`                            | `integer`         | Unique identifier for each record (primary key, auto-incremented).                                  |
| `typing_frequency_email`        | `double precision`| Frequency of keystrokes when typing in the **email** field.                                         |
| `typing_frequency_password`     | `double precision`| Frequency of keystrokes when typing in the **password** field.                                      |
| `keypress_duration_email`       | `double precision`| Average duration (in seconds) for each keystroke in the **email** field.                            |
| `keypress_duration_password`    | `double precision`| Average duration (in seconds) for each keystroke in the **password** field.                         |
| `mouse_or_tab`                  | `integer`         | Indicator for user navigation behavior (e.g., mouse clicks vs. tab key usage).                     |
| `field_interaction_time_mail`   | `double precision`| Total time (in seconds) spent interacting with the **email** input field.                           |
| `field_interaction_time_password`| `double precision`| Total time (in seconds) spent interacting with the **password** input field.                        |
| `login_submission_time`         | `double precision`| Time taken (in seconds) from field interaction to form submission.                                  |
| `mouse_movement_pattern`        | `integer`         | Numeric value representing mouse movement behavior (e.g., idle, linear movement, erratic patterns). |

---

### **Indexes**
- **Primary Key**: `anomaly_data_pkey`  
   - Ensures unique identification of each record using the `id` column.  
   - Uses a B-tree index for efficient lookups.

---

### **Schema Purpose**

This schema is tailored for applications that require **behavioral anomaly detection** to improve security. It collects and stores user interaction data when they interact with login forms or sensitive input fields. Specifically, it captures:

1. **Typing Behavior**:  
   - Frequency and duration of keystrokes provide insights into how users type. For example, bots or malicious actors may have a very uniform typing pattern.

2. **Navigation Behavior**:  
   - Mouse movements and tab key usage help identify automated or unusual navigation behavior.

3. **Interaction Time**:  
   - Field-specific interaction times help determine if a user spent an abnormal amount of time on a particular field.

4. **Login Submission Time**:  
   - Analyzes delays in form submission, which could indicate hesitation or unusual activity.

5. **Mouse Movement Patterns**:  
   - Detects irregularities in mouse behavior, such as erratic movements or lack of natural variation.

---

### **Use Case for Anomaly Detection**

1. **Fraud Detection in Banking Applications**:  
   This table provides key metrics to detect anomalies like bots or impersonation attempts during login.

2. **User Profiling**:  
   By analyzing patterns, the system can learn what "normal" behavior looks like and flag deviations.

3. **Security Auditing**:  
   Data stored in this table can help audit user login behavior over time.

4. **Model Training**:  
   This schema serves as the foundation for training machine learning models (like Isolation Forest) for anomaly detection.

---

### **Benefits of the Schema**

- **Granularity**: Captures detailed user behavior for robust analysis.  
- **Flexibility**: The double precision fields allow storing precise measurements.  
- **Performance**: Use of the primary key ensures efficient querying and data access.  
- **Extensibility**: Additional columns can be added to collect more behavioral metrics as needed.

---

### **Summary**

The `anomaly_data` table forms the backbone of the Behavioral Anomaly Detection system by storing user interaction metrics. These metrics can be used for training machine learning models to identify anomalies and enhance security in critical systems like banking or enterprise applications.
