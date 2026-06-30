import express from 'express';
import { check, param } from 'express-validator';
import { createRestaurant, listRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } from '../Controllers/restaurantController.js';
import { validateRequest } from '../Middleware/validator.js';
import { adminAuth } from '../Middleware/auth.js';

const restaurantRouter = express.Router();

/**
 * @openapi
 * /api/restaurants/add:
 *   post:
 *     summary: Add a new restaurant
 *     description: Creates a new restaurant record in the system (Required role admin).
 *     tags:
 *       - Restaurants
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
 *               - name
 *               - address
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza Palace
 *               address:
 *                 type: string
 *                 example: 123 Main St, New York, NY
 *               phone:
 *                 type: string
 *                 example: "+1-555-0199"
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Missing required fields or validation failure
 *       401:
 *         description: Unauthorized, token missing or failed
 *       403:
 *         description: Forbidden, admin role required
 *       500:
 *         description: Server error
 */
restaurantRouter.post(
  "/add",
  adminAuth,
  [
    check('name', 'Name is required').notEmpty(),
    check('address', 'Address is required').notEmpty(),
    check('phone', 'Phone is required').notEmpty(),
    validateRequest
  ],
  createRestaurant
);

/**
 * @openapi
 * /api/restaurants/list:
 *   get:
 *     summary: List all restaurants with search, sort, and pagination
 *     description: Returns a list of all registered restaurants. Supports pagination, sorting, and name/description keyword search.
 *     tags:
 *       - Restaurants
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
 *         description: Sort field (prefix with minus sign for descending sort, e.g. -name, name)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for case-insensitive matching on restaurant name/address
 *     responses:
 *       200:
 *         description: A paginated list of restaurants
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
 *                     $ref: '#/components/schemas/Restaurant'
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
 *                       example: 50
 *                     pages:
 *                       type: integer
 *                       example: 5
 *       500:
 *         description: Server error
 */
restaurantRouter.get("/list", listRestaurants);

/**
 * @openapi
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     description: Retrieves detailed information about a specific restaurant.
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
restaurantRouter.get(
  "/:id",
  [
    param('id', 'Invalid restaurant ID format').isMongoId(),
    validateRequest
  ],
  getRestaurantById
);

/**
 * @openapi
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update a restaurant
 *     description: Updates an existing restaurant record in the system (Required role admin).
 *     tags:
 *       - Restaurants
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza Palace Updated
 *               address:
 *                 type: string
 *                 example: 123 Main St, New York, NY
 *               phone:
 *                 type: string
 *                 example: "+1-555-0199"
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid ID format or validation failure
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, admin role required
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
restaurantRouter.put(
  "/:id",
  adminAuth,
  [
    param('id', 'Invalid restaurant ID format').isMongoId(),
    check('name', 'Name is required').notEmpty(),
    check('address', 'Address is required').notEmpty(),
    check('phone', 'Phone is required').notEmpty(),
    validateRequest
  ],
  updateRestaurant
);

/**
 * @openapi
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant
 *     description: Removes a restaurant from the system (Required role admin).
 *     tags:
 *       - Restaurants
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID to delete
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
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
 *                   example: Restaurant deleted
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, admin role required
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
restaurantRouter.delete(
  "/:id",
  adminAuth,
  [
    param('id', 'Invalid restaurant ID format').isMongoId(),
    validateRequest
  ],
  deleteRestaurant
);

export default restaurantRouter;