// main.jsx
// Entry point for the React app.
// This is where React mounts into the real HTML page (index.html -> <div id="root"></div>).
//
// We import global CSS here so it applies across the whole app:
// - styles.css  -> our ShopQuick theme (the important one)
// - index.css   -> Vite template defaults (optional, can conflict a bit with layout)

import "./styles.css"; // ShopQuick styling/theme (cards, buttons, layout etc.)

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Vite starter CSS (fine to keep, but can affect centering)
import App from "./App.jsx";

// Grab the root div from index.html and render our <App /> into it.
createRoot(document.getElementById("root")).render(
    <StrictMode>
        {/* StrictMode helps catch common bugs in development (it doesn't affect production build) */}
        <App />
    </StrictMode>
);