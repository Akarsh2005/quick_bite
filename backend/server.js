import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./config/db.js";

// Import routes
import userRouter from './Routes/userRoutes.js';
import restaurantRouter from './Routes/restaurantRoutes.js';
import foodRouter from './Routes/foodRoutes.js';
import cartRouter from './Routes/cartRoutes.js';
import orderRouter from './Routes/orderRoutes.js';
import chatbotRouter from './Routes/chatbotRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/foods', foodRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/chatbot', chatbotRouter);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Server is running successfully',
        chatbot: 'HTTP mode'
    });
});

const PORT = process.env.PORT || 5001;

// Connect to DB then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🤖 Chatbot API ready at /api/chatbot/message`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
});