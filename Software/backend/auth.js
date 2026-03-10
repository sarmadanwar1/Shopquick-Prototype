// auth.js
// Handles basic authentication for the prototype.
// Note: this is NOT production auth — it's intentionally simple (no DB) for coursework/demo.

import jwt from "jsonwebtoken";

// Secret used to sign/verify JWTs.
// In real life you'd put this in an environment variable (process.env.JWT_SECRET).
export const JWT_SECRET = "dev-secret-change-me";

// Hardcoded demo user (since we aren't using a database in this prototype).
// If you want more users later, you can add more objects and check them in login().
const DEMO_USER = {
    id: "u1",
    email: "demo@shopquick.com",
    password: "Password123!", // for demo only (normally you'd store a hash, not plaintext)
    name: "Demo User",
};

/**
 * Checks the provided email/password against our hardcoded demo user.
 * If valid, returns a JWT + basic user info. Otherwise returns null.
 */
export function login(email, password) {
    // Basic credential check (again: simple on purpose)
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
        // Create a signed token so the frontend can prove it's logged in
        const token = jwt.sign(
            { sub: DEMO_USER.id, email: DEMO_USER.email }, // payload: user id + email
            JWT_SECRET,
            { expiresIn: "1h" } // token expires after 1 hour
        );

        // Return token + "safe" user fields (no password)
        return {
            token,
            user: { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name },
        };
    }

    // Login failed
    return null;
}

/**
 * Express middleware that protects routes.
 * Looks for "Authorization: Bearer <token>" and verifies it.
 * If valid, it attaches the decoded token to req.user and allows the request through.
 */
export function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";

    // Expecting: "Bearer <token>"
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    // No token = not logged in
    if (!token) return res.status(401).json({ message: "Missing token" });

    try {
        // Verify token signature + expiry
        req.user = jwt.verify(token, JWT_SECRET);

        // Continue to the actual route handler
        next();
    } catch {
        // Token is invalid/expired
        return res.status(401).json({ message: "Invalid/expired token" });
    }
}