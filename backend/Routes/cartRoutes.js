import express from 'express';
import { check } from 'express-validator';
import { addToCart, getCart, removeFromCart } from '../Controllers/cartController.js';
import authMiddleware from '../Middleware/auth.js';
import { validateRequest } from '../Middleware/validator.js';

const cartRouter = express.Router();

/**
 * @openapi
 * /api/cart/get:
 *   post:
 *     summary: Retrieve user's cart data
 *     description: Gets the current items and quantities in the authenticated user's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 cartData:
 *                   type: object
 *                   description: Map of food item IDs to quantities
 *                   example: { "65f29b0a19e84b2e88a8d120": 2 }
 *       401:
 *         description: Not authorized, token missing or failed
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
cartRouter.post("/get", authMiddleware, getCart);

/**
 * @openapi
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     description: Increments the quantity of a specific food item in the user's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 example: 65f29b0a19e84b2e88a8d120
 *     responses:
 *       200:
 *         description: Added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Added To Cart
 *       400:
 *         description: Invalid item ID format
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Food item not found or User not found
 *       500:
 *         description: Server error
 */
cartRouter.post(
  "/add",
  authMiddleware,
  [
    check('itemId', 'Invalid item ID format').isMongoId(),
    validateRequest
  ],
  addToCart
);

/**
 * @openapi
 * /api/cart/remove:
 *   post:
 *     summary: Remove item from cart
 *     description: Decrements the quantity of a specific food item in the user's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 example: 65f29b0a19e84b2e88a8d120
 *     responses:
 *       200:
 *         description: Removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Removed From Cart
 *       400:
 *         description: Invalid item ID format
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
cartRouter.post(
  "/remove",
  authMiddleware,
  [
    check('itemId', 'Invalid item ID format').isMongoId(),
    validateRequest
  ],
  removeFromCart
);

export default cartRouter;