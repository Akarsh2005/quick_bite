import express from 'express';
import { handleAdminChatMessage, handleCustomerChatMessage, getChatHistory } from '../Controllers/chatbotController.js';

const chatbotRouter = express.Router();

// Admin chatbot route
chatbotRouter.post("/admin/message", handleAdminChatMessage);

// Customer chatbot route  
chatbotRouter.post("/customer/message", handleCustomerChatMessage);

// Common chat history route
chatbotRouter.get("/history/:sessionId", getChatHistory);

export default chatbotRouter;