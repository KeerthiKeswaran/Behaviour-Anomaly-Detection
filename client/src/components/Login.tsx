import React, { useState, useEffect } from 'react';
import { Lock, Mail, LogIn, ShieldX } from 'lucide-react';
import 'axios'
interface LoginFormData {
    email: string;
    password: string;
}

export function Login() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });

    const [startTime, setStartTime] = useState<number>(Date.now());

    const [typingFrequencyEmail, setTypingFrequencyEmail] = useState<number>(0);
    const [typingFrequencyPassword, setTypingFrequencyPassword] = useState<number>(0);

    const [keyPressDurationsEmail, setKeyPressDurationsEmail] = useState<number[]>([]);
    const [keyPressDurationEmail, setKeyPressDurationEmail] = useState<number>(0);

    const [keyPressDurationsPassword, setKeyPressDurationsPassword] = useState<number[]>([]);
    const [keyPressDurationPassword, setKeyPressDurationPassword] = useState<number>(0);

    const [emailFieldStartTime, setEmailFieldStartTime] = useState<number | null>(null);
    const [passwordFieldStartTime, setPasswordFieldStartTime] = useState<number | null>(null);

    const [keyDownTime, setKeyDownTime] = useState<number | null>(null);
    const [fieldInteractionTimeMail, setFieldInteractionTimeMail] = useState<number>(0);
    const [fieldInteractionTimePass, setFieldInteractionTimePass] = useState<number>(0);
    const [mouseMovementPattern, setMouseMovementPattern] = useState<number>(0);
    const [mouseOrTab, setMouseOrTab] = useState<number>(0);

    const [previousMousePosition, setPreviousMousePosition] = useState<{ x: number; y: number } | null>(null);

    const [anomaly, setAnomaly] = useState<string>("");



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const currentTime = Date.now();

        const calculatedLoginSubmissionTime = (currentTime - startTime) / 1000;
        const loginData = {
            typing_frequency_email: Math.round(typingFrequencyEmail * 10000) / 10000,
            typing_frequency_password: Math.round(typingFrequencyPassword * 10000) / 10000,
            keypress_duration_email: Math.round(keyPressDurationEmail * 10000) / 10000,
            keypress_duration_password: Math.round(keyPressDurationPassword * 10000) / 10000,
            mouse_or_tab: mouseOrTab,
            field_interaction_time_mail: fieldInteractionTimeMail,
            field_interaction_time_password: fieldInteractionTimePass,
            login_submission_time: calculatedLoginSubmissionTime,
            mouse_movement_pattern: mouseMovementPattern
        };

        console.log(loginData);

        try {
            const response = await fetch('http://127.0.0.1:8000/submit-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });
            const result = await response.json();
            console.log(result)
            const isAnomaly = result.is_anomaly;
            setAnomaly(isAnomaly);
        } catch (error) {
            console.error('Error sending data to backend:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) / (1000 * 60);

        if (elapsedTime > 0) {
            const wordsTyped = value.length / 5;
            const typingSpeed = wordsTyped / elapsedTime;
            if (name === 'email') {
                setTypingFrequencyEmail(typingSpeed);
            } else if (name === 'password') {
                setTypingFrequencyPassword(typingSpeed);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, fieldName : string) => {

        if (e.key === 'Tab') {
            setMouseOrTab(1);
        }
        setKeyDownTime(Date.now());

        const currentTime = Date.now();

        if (fieldName === 'email' && emailFieldStartTime !== null) {
            const interactionTime = (currentTime - emailFieldStartTime) / 1000;
            setFieldInteractionTimeMail(interactionTime);
        } else if (fieldName === 'password' && passwordFieldStartTime !== null) {
            const interactionTime = (currentTime - passwordFieldStartTime) / 1000;
            setFieldInteractionTimePass(interactionTime);
        }
       
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (keyDownTime !== null) {
            const duration = Date.now() - keyDownTime;
            if (e.currentTarget.name === 'email') {
                setKeyPressDurationsEmail((prevDurations) => {
                    const updatedDurations = [...prevDurations, duration];
                    const totalDuration = updatedDurations.reduce((a, b) => a + b, 0);
                    setKeyPressDurationEmail(totalDuration / updatedDurations.length);
                    return updatedDurations;
                });
            } else if (e.currentTarget.name === 'password') {
                setKeyPressDurationsPassword((prevDurations) => {
                    const updatedDurations = [...prevDurations, duration];
                    const totalDuration = updatedDurations.reduce((a, b) => a + b, 0);
                    setKeyPressDurationPassword(totalDuration / updatedDurations.length);
                    return updatedDurations;
                });
            }
        }
    };


    const handleFocus = (fieldName: string) => {
        if (fieldName === 'email') {
            setEmailFieldStartTime(Date.now());
        } else if (fieldName === 'password') {
            setPasswordFieldStartTime(Date.now());
        }
    };

    const handleBlur = (fieldName: string) => {
        const currentTime = Date.now();
        if (fieldName === 'email' && emailFieldStartTime !== null) {
            const interactionTime = (currentTime - emailFieldStartTime) / 1000; 
            setFieldInteractionTimeMail(interactionTime);
        } else if (fieldName === 'password' && passwordFieldStartTime !== null) {
            const interactionTime = (currentTime - passwordFieldStartTime) / 1000; 
            console.log(interactionTime)
            setFieldInteractionTimePass(interactionTime);
        }
    };


    useEffect(() => {
        const trackMouseMovement = (e: MouseEvent) => {
            const currentX = e.clientX;
            const currentY = e.clientY;

            if (previousMousePosition) {
                const deltaX = Math.abs(currentX - previousMousePosition.x);
                const deltaY = Math.abs(currentY - previousMousePosition.y);
                const threshold = 50;

                if (deltaX > threshold || deltaY > threshold) {
                    setMouseMovementPattern(1);
                } else {
                    setMouseMovementPattern(0);
                }
            }
            setPreviousMousePosition({ x: currentX, y: currentY });
        };

        window.addEventListener('mousemove', trackMouseMovement);

        return () => {
            window.removeEventListener('mousemove', trackMouseMovement);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <LogIn className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    onKeyUp={handleKeyUp}
                                    onKeyDown={(e) => handleKeyDown(e, 'email')}
                                    
                                    onFocus={() => handleFocus('email')}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    onKeyUp={handleKeyUp}
                                    onKeyDown={(e) => handleKeyDown(e, 'password')}
                                    onFocus={() => handleFocus('password')}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                        Sign in
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Don't have an account? </span>
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign up
                    </a>
                </div>
                {anomaly == "-1" ? (
                    <div className="flex items-center space-x-2 rounded-lg p-4 bg-red-50">
                        <ShieldX className="text-red-400 text-4xl" />
                        <h2 className="text-red-400 font-semibold text-xl">Anomaly Detected!</h2>
                    </div>
                ) : (
                    null
                )}
                {anomaly == "0" ? (
                    <div className="flex items-center space-x-2 rounded-lg p-4 bg-green-50">
                        <ShieldX className="text-green-400 text-4xl" />
                        <h2 className="text-green-400 font-semibold text-xl">Training Data!</h2>
                    </div>
                ) : (
                    null
                )}
            </div>
        </div>
    );
}
