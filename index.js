// index.js
const express = require("express");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(express.json());

// JWT verification function
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return null;
    }
}

// Download route
app.get("/download", async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res
            .status(401)
            .json({ error: "Unauthorized: No token provided" });
    }

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const { url, filename } = decodedToken;

    if (!url) {
        return res
            .status(400)
            .json({ error: "Bad Request: Video URL not found in token" });
    }

    // Set headers for download
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(filename)}"`,
    );

    // Redirect to the video URL
    res.redirect(url);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// For local development
if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
