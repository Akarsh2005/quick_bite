import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.body.userId = decoded.id;
            next();
        } catch (error) {
            console.log('JWT Error:', error.message);
            res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

export default authMiddleware;