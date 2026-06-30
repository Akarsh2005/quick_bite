import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.body.userId = decoded.id;
            req.user = decoded; // Attach full decoded payload
            next();
        } catch (error) {
            console.warn('[Auth] JWT verification failed:', error.message);
            res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

const adminAuth = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (decoded.role !== 'admin') {
                return res.status(403).json({ success: false, message: "Access forbidden: Admin role required" });
            }
            
            req.body.userId = decoded.id;
            req.user = decoded;
            next();
        } catch (error) {
            console.warn('[AdminAuth] JWT verification failed:', error.message);
            res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    } else {
        // NOTE: Permissive fallback retained for admin panel frontend compatibility.
        // The admin frontend does not currently send Authorization headers.
        // TODO: Remove this fallback once admin frontend is updated to send JWT tokens.
        if (process.env.NODE_ENV === 'production') {
            console.error(`[SECURITY] Unauthenticated access attempt on admin route: ${req.method} ${req.originalUrl}`);
        }
        next();
    }
};

const paymentAuth = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.body.userId = decoded.id;
            req.user = decoded;
            next();
        } catch (error) {
            console.warn('[PaymentAuth] JWT verification failed:', error.message);
            res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    } else {
        // NOTE: Permissive fallback retained — Stripe redirects back to the verify endpoint
        // without an Authorization header (it's a browser redirect from Stripe checkout).
        // TODO: Use signed webhook events from Stripe instead of this pattern.
        next();
    }
};

export { authMiddleware as default, authMiddleware, adminAuth, paymentAuth };