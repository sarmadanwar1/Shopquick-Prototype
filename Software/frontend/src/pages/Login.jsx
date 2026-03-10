// Login.jsx
// Simple login screen for the prototype.
// This talks to the backend (/auth/login) to get a JWT token.
// Since we don't have a DB, it's a single hardcoded demo user (see backend/auth.js).

import { useState } from "react";
import { login as loginApi } from "../api"; // frontend helper that calls POST /auth/login

export default function Login({ onLogin }) {
    // Prefilled demo creds so the marker can log in quickly during a demo
    const [email, setEmail] = useState("demo@shopquick.com");
    const [password, setPassword] = useState("Password123!");
    const [error, setError] = useState("");

    /**
     * Handles the login form submit.
     * On success:
     *  - store JWT token in localStorage (so refresh keeps you logged in)
     *  - call onLogin(token) so App.jsx can swap to the Dashboard
     */
    async function handleSubmit(e) {
        e.preventDefault(); // stop page refresh
        setError("");       // clear any old error message

        try {
            // Call backend login endpoint
            const data = await loginApi(email, password);

            // Store token locally (basic approach for a prototype)
            localStorage.setItem("token", data.token);

            // Tell parent component we're logged in now
            onLogin(data.token);
        } catch {
            // If backend rejects login, show a simple message
            setError("Invalid login (use the demo credentials).");
        }
    }

    return (
        <div className="center">
            {/* Login "card" */}
            <div className="card loginCard">
                {/* Brand header */}
                <div className="brand" style={{ marginBottom: 10 }}>
                    <div className="logo" aria-hidden="true">
                        {/* Little cart icon so it feels like a grocery app */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M7 18c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1Zm10 0c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1Z"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L22 7H6"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div>
                        <h1>ShopQuick</h1>
                        <p>AI Grocery Savings Assistant (Prototype)</p>
                    </div>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
                    <label className="label">Email</label>
                    <input
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="demo@shopquick.com"
                    />

                    <label className="label">Password</label>
                    <input
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password123!"
                        type="password"
                    />

                    <button className="btn btn-primary" type="submit">
                        Login
                    </button>

                    {/* Render error only if login failed */}
                    {error && <div className="error">{error}</div>}
                </form>

                {/* Small footer note so it's clear this is demo-only auth */}
                <div
                    style={{
                        marginTop: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span className="subtle">Demo login: demo@shopquick.com</span>
                    <span className="badge">No real accounts</span>
                </div>
            </div>
        </div>
    );
}