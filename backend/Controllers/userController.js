import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

const createToken = (id, role = 'customer') => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Helper to build safe user object — uses _id consistently
const buildUserPayload = (user) => ({
    _id: user._id,
    id: user._id,      // keep both for backward compatibility
    name: user.name,
    email: user.email,
    role: user.role || 'customer',
});

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id, user.role || 'customer');
        res.json({ success: true, token, user: buildUserPayload(user) });
    } catch (error) {
        next(error);
    }
};

const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({ name, email, password: hashedPassword, role: 'customer' });
        const user = await newUser.save();
        const token = createToken(user._id, user.role);
        res.status(201).json({ success: true, token, user: buildUserPayload(user) });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        // req.user.id is set by authMiddleware from the JWT token
        const user = await userModel.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user: buildUserPayload(user) });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name, currentPassword, newPassword } = req.body;
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (name) user.name = name;

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Current password is required to change password" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Current password is incorrect" });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();
        res.json({ success: true, message: "Profile updated", user: buildUserPayload(user) });
    } catch (error) {
        next(error);
    }
};

export { loginUser, registerUser, getProfile, updateProfile };