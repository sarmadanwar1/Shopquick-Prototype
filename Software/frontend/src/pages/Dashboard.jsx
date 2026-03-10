// Dashboard.jsx
// Main logged-in screen for the prototype.
// This is where the user enters a postcode + shopping request, then we show:
// - chat-style "AI" response
// - store comparison table
// - per-store item breakdown (using mock prices)

import { useState } from "react";
import { compare } from "../api"; // small helper that calls the backend /compare endpoint

export default function Dashboard({ token, onLogout }) {
    // Basic form inputs
    const [postcode, setPostcode] = useState("BD21 1AA");
    const [requestText, setRequestText] = useState("£30 budget, chicken, rice, nappies");

    // UI state
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Simple chat history. We start with a welcome message.
    // Each message is: { role: "ai" | "user", text: string }
    const [chat, setChat] = useState([
        {
            role: "ai",
            text: "Hi! Enter your postcode and what you need (and a budget if you want). I’ll find the cheapest basket.",
        },
    ]);

    /**
     * Called when the user clicks "Find cheapest basket".
     * Sends postcode + requestText to the backend and updates:
     * - chat history
     * - result JSON (table + breakdown)
     */
    async function handleCompare() {
        // Add the user's message to chat straight away (feels more like a real assistant)
        const userMsg = `Postcode: ${postcode}\nRequest: ${requestText}`;
        setChat((prev) => [...prev, { role: "user", text: userMsg }]);

        setLoading(true);
        setResult(null);

        try {
            // Fake delay so it looks like the agent is "thinking"
            await new Promise((r) => setTimeout(r, 900));

            // Call backend (protected route). Token gets sent in Authorization header in api.js
            const data = await compare(token, { postcode, requestText });

            // Save the full response so the table/breakdown can render
            setResult(data);

            // Add the AI message response into chat
            setChat((prev) => [...prev, { role: "ai", text: data.aiMessage }]);
        } catch (e) {
            // If backend is off or token expired, show a friendly error
            const errMsg = "Something went wrong calling the backend. Is it running on :5001?";
            setResult({ aiMessage: errMsg });
            setChat((prev) => [...prev, { role: "ai", text: errMsg }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            {/* Header / top bar */}
            <div className="topbar">
                <div className="brand">
                    {/* Simple icon so it feels like a grocery brand */}
                    <div className="logo" aria-hidden="true">
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
                        <h1>ShopQuick Prototype</h1>
                        <p>Find the cheapest basket within 3 miles (mock prices)</p>
                    </div>
                </div>

                {/* Logout just clears token (handled in App.jsx) */}
                <button
                    className="btn btn-ghost"
                    onClick={() => {
                        localStorage.removeItem("token");
                        onLogout();
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Two-column layout: inputs on left, chat on right */}
            <div className="grid">
                {/* Inputs */}
                <div className="card">
                    <h3>Build your basket</h3>
                    <div className="subtle">Enter a postcode + what you need. Add a budget like “£30”.</div>

                    <label className="label">Postcode</label>
                    <input
                        className="input"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                    />

                    <label className="label">Shopping request</label>
                    <textarea
                        className="textarea"
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                        rows={5}
                    />

                    <button
                        className="btn btn-primary"
                        onClick={handleCompare}
                        style={{ marginTop: 12 }}
                    >
                        Find cheapest basket
                    </button>

                    {/* We don't actually check distance yet, but this matches the brief / user journey */}
                    <div style={{ marginTop: 10 }} className="subtle">
                        Searching within 3 miles of <b>{postcode}</b>
                    </div>
                </div>

                {/* Chat */}
                <div className="card">
                    <h3>ShopQuick Assistant</h3>

                    {/* Chat history box */}
                    <div className="chatBox">
                        {chat.map((m, idx) => (
                            <div key={idx} className={`bubble ${m.role}`}>
                                {m.text}
                            </div>
                        ))}

                        {/* Loading message as an AI bubble */}
                        {loading && <div className="bubble ai">ShopQuick is comparing stores…</div>}
                    </div>

                    {/* Quick summary badges once we have results */}
                    {result?.items && (
                        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <span className="badge">Items: {result.items.join(", ")}</span>
                            <span className="badge">
                                Budget: {result.budget != null ? `£${result.budget.toFixed(2)}` : "None"}
                            </span>
                            <span className="badge">Radius: 3 miles</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Store comparison table (shows totals and difference vs cheapest store) */}
            {result?.comparison && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3>Store comparison</h3>

                    <div className="tableWrap">
                        <table>
                            <thead>
                            <tr>
                                <th>Store</th>
                                <th className="right">Total</th>
                                <th className="right">Diff vs Cheapest</th>
                                <th>Missing</th>
                            </tr>
                            </thead>
                            <tbody>
                            {result.comparison.map((row) => (
                                <tr key={row.store} className={row.diff === 0 ? "rowCheapest" : ""}>
                                    <td>
                                        {row.store}
                                        {/* Mark the cheapest store so it stands out */}
                                        {row.diff === 0 ? (
                                            <span className="badge" style={{ marginLeft: 8 }}>
                                                    Cheapest
                                                </span>
                                        ) : null}
                                    </td>

                                    <td className="right">£{row.total.toFixed(2)}</td>
                                    <td className="right">
                                        {row.diff === 0 ? "£0.00" : `+£${row.diff.toFixed(2)}`}
                                    </td>

                                    <td>{row.missing?.length ? row.missing.join(", ") : "-"}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Item breakdown per store (so it's obvious we are using mock prices) */}
            {result?.comparison && (
                <div className="card" style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0 }}>Item breakdown (mock prices)</h3>
                        <span className="badge">Demo data</span>
                    </div>

                    <div className="breakGrid" style={{ marginTop: 12 }}>
                        {result.comparison.map((store) => (
                            <div key={store.store} className="storeCard">
                                <div className="storeHead">
                                    <b>{store.store}</b>
                                    <b>£{store.total.toFixed(2)}</b>
                                </div>

                                {/* List of item prices for this store */}
                                <div style={{ marginTop: 8 }}>
                                    {store.lineItems?.map((li) => (
                                        <div key={li.item} className="kv">
                                            <span>{li.item}</span>
                                            <span>{li.price == null ? "N/A" : `£${li.price.toFixed(2)}`}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* If we couldn't find an item price, show it here */}
                                {store.missing?.length > 0 && (
                                    <div className="missing">Missing: {store.missing.join(", ")}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="subtle" style={{ marginTop: 12 }}>
                        * Prices are mock values for prototype/demo only.
                    </div>
                </div>
            )}
        </div>
    );
}