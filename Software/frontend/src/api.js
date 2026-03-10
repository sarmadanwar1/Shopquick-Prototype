// api.js
// Small wrapper around fetch() so the rest of the frontend doesn't have to repeat
// the same request setup over and over.
// If the backend URL/port changes, update it here and you're done.

const API = "http://localhost:5001";

/**
 * Logs in with email + password.
 * Calls backend: POST /auth/login
 * Returns: { token, user }
 */
export async function login(email, password) {
    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    // If backend returns 401 or anything non-200, we treat it as a login failure.
    // Frontend caller can catch and show a nice message.
    if (!res.ok) throw new Error("Login failed");

    return res.json();
}

/**
 * Sends the shopping request to the backend "agent".
 * Calls backend: POST /compare (protected)
 *
 * token: JWT string from login
 * payload: { postcode, requestText }
 *
 * Returns the full compare JSON used by the UI:
 *  - aiMessage, cheapest, second, comparison[], etc.
 */
export async function compare(token, payload) {
    const res = await fetch(`${API}/compare`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Backend expects: Authorization: Bearer <token>
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    // If token expired or backend is down, this will throw and the UI can show an error.
    if (!res.ok) throw new Error("Compare failed");

    return res.json();
}