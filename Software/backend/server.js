// server.js
// Main API server for the ShopQuick prototype.
// This is where the "agent logic" lives: parse the request, total up mock prices,
// and return a response the frontend can render (chat + table + breakdown).

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { login, requireAuth } from "./auth.js";

const app = express();

// Allow requests from the React dev server.
// If your frontend runs on a different port, update this origin.
app.use(cors({ origin: "http://localhost:5173" }));

// Parse JSON bodies (so we can read req.body in POST requests).
app.use(express.json());

// Simple health-check route so you can click the backend URL and see it's alive.
app.get("/", (req, res) => {
    res.send("ShopQuick backend is running ✅");
});

// In ES modules we don't get __dirname automatically, so we recreate it.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load mock prices once on startup.
// If you edit prices.json, restart the backend so it reloads.
const prices = JSON.parse(
    fs.readFileSync(path.join(__dirname, "prices.json"), "utf-8")
);

/**
 * Pulls the first "£number" from the text, if there is one.
 * Examples:
 *  - "£30 budget, chicken, rice"  -> 30
 *  - "I have £40 for the week..." -> 40
 */
function parseBudget(text) {
    const m = text.match(/£\s*(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : null;
}

/**
 * Very simple item parsing for the prototype:
 *  - lowercase everything
 *  - remove budget text like "£30" and the word "budget"
 *  - split items by comma
 *
 * So we expect users to type items like: "chicken, rice, nappies"
 */
function parseItems(text) {
    return text
        .toLowerCase()
        .replace(/£\s*\d+(?:\.\d+)?/g, "") // remove any £ amounts
        .replace(/budget/g, "")           // remove the word budget
        .split(",")                       // items separated by commas
        .map((s) => s.trim())             // clean spaces
        .filter(Boolean);                 // remove empty items
}

// Helper to keep prices/totals to 2dp.
// (We store numbers, frontend formats them as £xx.xx)
function round2(n) {
    return Math.round(n * 100) / 100;
}

/**
 * Login endpoint:
 * Frontend sends email + password.
 * Backend checks demo user (in auth.js) and returns a JWT token if valid.
 */
app.post("/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    const result = login(email, password);

    if (!result) return res.status(401).json({ message: "Invalid credentials" });

    res.json(result);
});

/**
 * "Who am I" endpoint (protected).
 * Useful for testing that JWT auth is working.
 */
app.get("/me", requireAuth, (req, res) => {
    res.json({ ok: true, user: req.user });
});

/**
 * Main feature endpoint (protected):
 * Takes postcode + requestText (budget + items), totals up prices per store,
 * then returns the cheapest store + comparison table + item breakdown.
 */
app.post("/compare", requireAuth, (req, res) => {
    const { postcode, requestText } = req.body || {};

    // Extract budget (optional) + items list
    const budget = parseBudget(requestText || "");
    const items = parseItems(requestText || "");

    // Build one "row" per store containing totals + missing items + per-item breakdown
    const rows = Object.entries(prices).map(([store, storePrices]) => {
        let missing = [];
        let total = 0;

        // For the UI breakdown: price each item (or mark as N/A if missing)
        const lineItems = items.map((item) => {
            const price = storePrices[item];

            if (price == null) {
                missing.push(item);
                return { item, price: null };
            }

            total += price;
            return { item, price: round2(price) };
        });

        return { store, total: round2(total), missing, lineItems };
    });

    // Sort by total cost so rows[0] is the cheapest
    rows.sort((a, b) => a.total - b.total);

    const cheapest = rows[0];
    const second = rows[1] || null;

    // Budget status (optional)
    const underOver = budget == null ? null : round2(budget - cheapest.total);

    const budgetMessage =
        budget == null
            ? ""
            : underOver >= 0
                ? `You are £${underOver.toFixed(2)} under budget.`
                : `You are £${Math.abs(underOver).toFixed(2)} over budget.`;

    // This is our "AI response" text (generated, not real AI)
    const aiMessage =
        `Searching within 3 miles of ${postcode || "your area"}...\n` +
        `Cheapest basket is £${cheapest.total.toFixed(2)} at ${cheapest.store}. ` +
        (second
            ? `Second best is ${second.store} at £${second.total.toFixed(2)}. `
            : "") +
        budgetMessage;

    // Comparison table: add a diff column so UI can show "how much more"
    const cheapestTotal = cheapest.total;
    const comparison = rows.map((r) => ({
        store: r.store,
        total: r.total,
        diff: round2(r.total - cheapestTotal),
        missing: r.missing,
        lineItems: r.lineItems,
    }));

    // Send everything the frontend needs to render chat + tables + breakdown
    res.json({
        postcode,
        budget,
        items,
        aiMessage,
        cheapest,
        second,
        comparison,
    });
});

// Start server
app.listen(5001, () => {
    console.log("Backend running on http://localhost:5001");
});