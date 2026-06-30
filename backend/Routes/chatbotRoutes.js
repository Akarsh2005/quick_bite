import express from 'express';
import { check, param } from 'express-validator';
import { handleAdminChatMessage, handleCustomerChatMessage, getChatHistory } from '../Controllers/chatbotController.js';
import { validateRequest } from '../Middleware/validator.js';
import { adminAuth } from '../Middleware/auth.js';

const chatbotRouter = express.Router();

/**
 * @openapi
 * /api/chatbot/admin/message:
 *   post:
 *     summary: Handle Admin Chatbot Message
 *     description: Processes an admin query using intent classification and performs restaurant, food, or order management actions (Required role admin).
 *     tags:
 *       - Admin
 *       - Search
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - sessionId
 *             properties:
 *               message:
 *                 type: string
 *                 example: list all orders
 *               sessionId:
 *                 type: string
 *                 example: admin_session_1719792000
 *               userId:
 *                 type: string
 *                 example: admin_1
 *     responses:
 *       200:
 *         description: Message processed and response generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   description: Chatbot text response
 *                   example: "Here are the active orders in the system..."
 *                 intent:
 *                   type: string
 *                   example: admin_list_orders
 *                 confidence:
 *                   type: number
 *                   example: 0.95
 *                 sessionId:
 *                   type: string
 *                   example: admin_session_1719792000
 *                 modelUsed:
 *                   type: string
 *                   example: ai_model
 *       400:
 *         description: Message or Session ID is required / validation failure
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, admin role required
 *       500:
 *         description: Error processing admin message
 */
chatbotRouter.post(
  "/admin/message",
  adminAuth,
  [
    check('message', 'Message is required').notEmpty(),
    check('sessionId', 'Session ID is required').notEmpty(),
    validateRequest
  ],
  handleAdminChatMessage
);

/**
 * @openapi
 * /api/chatbot/customer/message:
 *   post:
 *     summary: Handle Customer Chatbot Message
 *     description: Processes a customer search/FAQ message, optionally utilizing their auth token for cart, order, and profile tasks.
 *     tags:
 *       - Search
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - sessionId
 *             properties:
 *               message:
 *                 type: string
 *                 example: search for pizza
 *               sessionId:
 *                 type: string
 *                 example: customer_session_1719792000
 *               userId:
 *                 type: string
 *                 example: user_123
 *     responses:
 *       200:
 *         description: Message processed and response generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   description: Chatbot text response
 *                   example: "Here are the Pizza options I found..."
 *                 intent:
 *                   type: string
 *                   example: customer_search_food_name
 *                 confidence:
 *                   type: number
 *                   example: 0.88
 *                 sessionId:
 *                   type: string
 *                   example: customer_session_1719792000
 *                 modelUsed:
 *                   type: string
 *                   example: ai_model
 *                 userId:
 *                   type: string
 *                   example: user_123
 *                 isAuthenticated:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Message or Session ID is required / validation failure
 *       500:
 *         description: Error processing customer message
 */
chatbotRouter.post(
  "/customer/message",
  [
    check('message', 'Message is required').notEmpty(),
    check('sessionId', 'Session ID is required').notEmpty(),
    validateRequest
  ],
  handleCustomerChatMessage
);

/**
 * @openapi
 * /api/chatbot/history/{sessionId}:
 *   get:
 *     summary: Retrieve Chat Session History
 *     description: Returns the message history (up to last 50 messages) for a given session.
 *     tags:
 *       - Search
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique chat session ID
 *     responses:
 *       200:
 *         description: Session history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Session ID parameter is invalid
 *       500:
 *         description: Error retrieving chat history
 */
chatbotRouter.get(
  "/history/:sessionId",
  [
    param('sessionId', 'Session ID is required').notEmpty(),
    validateRequest
  ],
  getChatHistory
);

export default chatbotRouter;