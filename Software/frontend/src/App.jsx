// App.jsx
// The "router" for this tiny prototype.
// We don't use react-router here because we only have two states/screens:
// - not logged in  -> show <Login />
// - logged in      -> show <Dashboard />
//
// Token is stored in localStorage so a page refresh keeps you signed in (basic demo behaviour).

import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
    // Read any existing token on first load (so refresh doesn't log you out)
    const [token, setToken] = useState(localStorage.getItem("token"));

    // If token exists, user is "logged in" for the prototype, so show dashboard
    // Otherwise show login screen.
    return token ? (
        <Dashboard
            token={token}
            // Dashboard handles clearing localStorage itself, we just clear state here
            onLogout={() => setToken(null)}
        />
    ) : (
        <Login
            // Login passes token back up so App can switch screens
            onLogin={(t) => setToken(t)}
        />
    );
}