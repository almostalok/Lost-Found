import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
    let token = null;

    if (
        req.headers.authorization &&
        req.headers.authorization.toLowerCase().startsWith("bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // Fallback: try to read token from Cookie header (if client stored token in cookie)
    if (!token) {
        const cookieHeader = req.headers.cookie;
        if (cookieHeader) {
            // simple parse: token=<value>; other=...;
            const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
            if (match) {
                token = match.split('=')[1];
            }
        }
    }

    if (!token) {
        // helpful debug log — remove or lower log level in production
        console.debug('protect middleware: no token found. authorization header:', req.headers.authorization, 'cookie header:', req.headers.cookie);
        res.status(401);
        throw new Error("Not authorized, token missing");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (err) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
};

// Middleware to require admin privileges
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authenticated');
    }
    if (!req.user.isAdmin) {
        res.status(403);
        throw new Error('Admin privileges required');
    }
    next();
};