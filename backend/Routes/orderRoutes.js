import express from 'express';
import { check } from 'express-validator';
import authMiddleware, { adminAuth, paymentAuth } from '../Middleware/auth.js';
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder, placeOrderCod } from '../Controllers/orderController.js';
import { validateRequest } from '../Middleware/validator.js';

const orderRouter = express.Router();

/**
 * @openapi
 * /api/orders/list:
 *   get:
 *     summary: List all orders with sorting and pagination
 *     description: Returns a list of all orders in the system. Supports pagination, sorting, status filtering, and payment filters. Required role admin.
 *     tags:
 *       - Orders
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "-createdAt"
 *         description: Sort field (prefix with minus sign for descending sort, e.g. -amount, amount)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status filter (e.g. Food Processing, Out for Delivery, Delivered)
 *       - in: query
 *         name: payment
 *         schema:
 *           type: boolean
 *         description: Payment filter (true/false)
 *     responses:
 *       200:
 *         description: A paginated list of all orders
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
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 200
 *                     pages:
 *                       type: integer
 *                       example: 20
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, admin role required
 *       500:
 *         description: Server error
 */
orderRouter.get("/list", adminAuth, listOrders);

/**
 * @openapi
 * /api/orders/userorders:
 *   post:
 *     summary: Retrieve user's orders with sorting and pagination
 *     description: Returns a list of orders placed by the authenticated user. Supports page, limit, and sorting query parameters.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "-createdAt"
 *         description: Sort field (prefix with minus sign for descending sort, e.g. -amount, amount)
 *     responses:
 *       200:
 *         description: A paginated list of user orders
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
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     pages:
 *                       type: integer
 *                       example: 2
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
orderRouter.post("/userorders", authMiddleware, userOrders);

/**
 * @openapi
 * /api/orders/place:
 *   post:
 *     summary: Place an order (Online Payment simulation)
 *     description: Creates an order and returns a mock Stripe session URL for payment verification.
 *     tags:
 *       - Orders
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - amount
 *               - address
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: [ { "_id": "65f29b0a19e84b2e88a8d120", "name": "Margherita Pizza", "price": 299, "quantity": 1 } ]
 *               amount:
 *                 type: number
 *                 example: 349
 *               address:
 *                 type: object
 *                 example: { "firstName": "John", "lastName": "Doe", "email": "john@example.com", "street": "123 Main St", "city": "New York", "state": "NY", "zipcode": "10001", "phone": "1234567890" }
 *     responses:
 *       200:
 *         description: Order created with mock payment session
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
 *                   example: Order placed successfully!
 *                 orderId:
 *                   type: string
 *                   example: 65f29c0a19e84b2e88a8d130
 *                 session_url:
 *                   type: string
 *                   example: http://localhost:5173/verify?success=true&orderId=65f29c0a19e84b2e88a8d130
 *       400:
 *         description: Empty items or validation failure
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
orderRouter.post(
  "/place",
  authMiddleware,
  [
    check('items', 'Order items array cannot be empty').isArray({ min: 1 }),
    check('amount', 'Amount must be a positive number').isFloat({ min: 0 }),
    check('address', 'Delivery address is required').isObject().notEmpty(),
    validateRequest
  ],
  placeOrder
);

/**
 * @openapi
 * /api/orders/placecod:
 *   post:
 *     summary: Place a Cash on Delivery order
 *     description: Places an order with Cash on Delivery option (instantly marked as paid/approved for processing).
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - amount
 *               - address
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: [ { "_id": "65f29b0a19e84b2e88a8d120", "name": "Margherita Pizza", "price": 299, "quantity": 1 } ]
 *               amount:
 *                 type: number
 *                 example: 349
 *               address:
 *                 type: object
 *                 example: { "firstName": "John", "lastName": "Doe", "email": "john@example.com", "street": "123 Main St", "city": "New York", "state": "NY", "zipcode": "10001", "phone": "1234567890" }
 *     responses:
 *       200:
 *         description: Order placed successfully
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
 *                   example: Order Placed
 *       400:
 *         description: Empty items or validation failure
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
orderRouter.post(
  "/placecod",
  authMiddleware,
  [
    check('items', 'Order items array cannot be empty').isArray({ min: 1 }),
    check('amount', 'Amount must be a positive number').isFloat({ min: 0 }),
    check('address', 'Delivery address is required').isObject().notEmpty(),
    validateRequest
  ],
  placeOrderCod
);

/**
 * @openapi
 * /api/orders/status:
 *   post:
 *     summary: Update order status
 *     description: Updates the status of a specific order (e.g. Out for Delivery, Delivered) (Required role admin).
 *     tags:
 *       - Orders
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - status
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 65f29c0a19e84b2e88a8d130
 *               status:
 *                 type: string
 *                 example: Out for Delivery
 *     responses:
 *       200:
 *         description: Status updated successfully
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
 *                   example: Status Updated
 *       400:
 *         description: Invalid order ID format or validation failure
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, admin role required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
orderRouter.post(
  "/status",
  adminAuth,
  [
    check('orderId', 'Invalid order ID format').isMongoId(),
    check('status', 'Status field is required').notEmpty(),
    validateRequest
  ],
  updateStatus
);

/**
 * @openapi
 * /api/orders/verify:
 *   post:
 *     summary: Verify order payment
 *     description: Verifies payment for an order. Deletes the order if payment is failed, otherwise marks payment as true.
 *     tags:
 *       - Orders
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - success
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 65f29c0a19e84b2e88a8d130
 *               success:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 example: "true"
 *     responses:
 *       200:
 *         description: Payment verification processed
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
 *                   example: Payment Verified
 *       400:
 *         description: Invalid order ID format or success state format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
orderRouter.post(
  "/verify",
  paymentAuth,
  [
    check('orderId', 'Invalid order ID format').isMongoId(),
    check('success', 'Success must be string true or false').isIn(['true', 'false']),
    validateRequest
  ],
  verifyOrder
);

export default orderRouter;