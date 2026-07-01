import express from 'express';
import { check, param } from 'express-validator';
import { addFood, listFood, removeFood, updateFood, listFoodByRestaurant } from '../Controllers/foodController.js';
import { validateRequest } from '../Middleware/validator.js';
import { adminAuth } from '../Middleware/auth.js';
import { upload } from '../Middleware/upload.js';

const foodRouter = express.Router();

/**
 * @openapi
 * /api/foods/list:
 *   get:
 *     summary: List all food items with search, sort, and pagination
 *     description: Returns a list of all registered food items, populating restaurant details. Supports page, limit, sorting, filtering by category/restaurant, and text search on food name/description.
 *     tags:
 *       - Food
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
 *         description: Sort field (prefix with minus sign for descending sort, e.g. -price, price)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for matching on food name or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter (e.g. Pizza, Pasta, Sandwich)
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *         description: Restaurant ID filter
 *     responses:
 *       200:
 *         description: A paginated list of food items
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
 *                     $ref: '#/components/schemas/Food'
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
 *                       example: 120
 *                     pages:
 *                       type: integer
 *                       example: 12
 *       500:
 *         description: Server error
 */
foodRouter.get("/list", listFood);

/**
 * @openapi
 * /api/foods/restaurant/{restaurantId}:
 *   get:
 *     summary: List food items by restaurant
 *     description: Returns a list of food items associated with a specific restaurant.
 *     tags:
 *       - Food
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The restaurant ID
 *     responses:
 *       200:
 *         description: A list of food items for the restaurant
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
 *                     $ref: '#/components/schemas/Food'
 *       400:
 *         description: Invalid restaurant ID format
 *       500:
 *         description: Server error
 */
foodRouter.get(
  "/restaurant/:restaurantId",
  [
    param('restaurantId', 'Invalid restaurant ID format').isMongoId(),
    validateRequest
  ],
  listFoodByRestaurant
);

/**
 * @openapi
 * /api/foods/add:
 *   post:
 *     summary: Add a new food item
 *     description: Creates a new food item under a specified restaurant (Required role admin).
 *     tags:
 *       - Food
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
 *               - description
 *               - price
 *               - category
 *               - restaurantId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Margherita Pizza
 *               description:
 *                 type: string
 *                 example: Classic cheese and tomato sauce pizza
 *               price:
 *                 type: number
 *                 example: 299
 *               category:
 *                 type: string
 *                 example: Pizza
 *               restaurantId:
 *                 type: string
 *                 example: 65f29a0a19e84b2e88a8d11c
 *     responses:
 *       200:
 *         description: Food item added successfully
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
 *                   example: Food Added
 *                 data:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Validation failure or invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, admin role required
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
foodRouter.post(
  "/add",
  adminAuth,
  upload.single('image'),
  [
    check('name', 'Name is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('price', 'Price must be a positive number').isFloat({ min: 0 }),
    check('category', 'Category is required').notEmpty(),
    check('restaurantId', 'Invalid restaurant ID format').isMongoId(),
    validateRequest
  ],
  addFood
);

/**
 * @openapi
 * /api/foods/{id}:
 *   put:
 *     summary: Update food item by ID
 *     description: Updates details of an existing food item (Required role admin).
 *     tags:
 *       - Food
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The food item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Margherita Pizza Special
 *               description:
 *                 type: string
 *                 example: Special cheese and tomato sauce pizza
 *               price:
 *                 type: number
 *                 example: 349
 *               category:
 *                 type: string
 *                 example: Pizza
 *               restaurantId:
 *                 type: string
 *                 example: 65f29a0a19e84b2e88a8d11c
 *     responses:
 *       200:
 *         description: Food item updated successfully
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
 *                   example: Food Updated
 *                 data:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Invalid ID format or validation failure
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, admin role required
 *       404:
 *         description: Food item or Restaurant not found
 *       500:
 *         description: Server error
 */
foodRouter.put(
  "/:id",
  adminAuth,
  upload.single('image'),
  [
    param('id', 'Invalid food ID format').isMongoId(),
    check('name', 'Name is required').optional().notEmpty(),
    check('description', 'Description is required').optional().notEmpty(),
    check('price', 'Price must be a positive number').optional().isFloat({ min: 0 }),
    check('category', 'Category is required').optional().notEmpty(),
    check('restaurantId', 'Invalid restaurant ID format').optional().isMongoId(),
    validateRequest
  ],
  updateFood
);

/**
 * @openapi
 * /api/foods/remove:
 *   post:
 *     summary: Remove food item
 *     description: Deletes a food item from the database using its ID passed in the request body (Required role admin).
 *     tags:
 *       - Food
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
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: The food ID to remove
 *                 example: 65f29b0a19e84b2e88a8d120
 *     responses:
 *       200:
 *         description: Food item removed successfully
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
 *                   example: Food Removed
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, admin role required
 *       404:
 *         description: Food item not found
 *       500:
 *         description: Server error
 */
foodRouter.post(
  "/remove",
  adminAuth,
  [
    check('id', 'Invalid food ID format').isMongoId(),
    validateRequest
  ],
  removeFood
);

export default foodRouter;