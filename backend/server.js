import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from "./config/db.js";

// Import routes
import userRouter from './Routes/userRoutes.js';
import restaurantRouter from './Routes/restaurantRoutes.js';
import foodRouter from './Routes/foodRoutes.js';
import cartRouter from './Routes/cartRoutes.js';
import orderRouter from './Routes/orderRoutes.js';
import chatbotRouter from './Routes/chatbotRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { errorHandler } from './Middleware/errorHandler.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Security ──────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Rate limiting — 100 requests per 15 min per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." }
});
app.use('/api', limiter);

// ── CORS ──────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL    || 'http://localhost:5174',
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Swagger UI)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files (food images) ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────
app.use('/api/users',       userRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/foods',       foodRouter);
app.use('/api/cart',        cartRouter);
app.use('/api/orders',      orderRouter);
app.use('/api/chatbot',     chatbotRouter);
app.use('/api-docs',        swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health check ──────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// ── Centralized error handler ─────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
        console.log(`🏥 Health:   http://localhost:${PORT}/health`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});