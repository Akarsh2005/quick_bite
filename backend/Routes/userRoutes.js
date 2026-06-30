import express from 'express';
import { check } from 'express-validator';
import { loginUser, registerUser } from '../Controllers/userController.js';
import { validateRequest } from '../Middleware/validator.js';

const userRouter = express.Router();

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with name, email, and password.
 *     tags:
 *       - Authentication
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: mysecurepassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 65f29d0a19e84b2e88a8d140
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *       400:
 *         description: Invalid input parameters or User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User already exists
 *       500:
 *         description: Server error
 */
userRouter.post(
  "/register",
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password must be 8 or more characters').isLength({ min: 8 }),
    validateRequest
  ],
  registerUser
);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates user credentials and returns a JWT token.
 *     tags:
 *       - Authentication
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mysecurepassword123
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 65f29d0a19e84b2e88a8d140
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *       400:
 *         description: Invalid email format or body inputs
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User does not exist
 *       500:
 *         description: Server error
 */
userRouter.post(
  "/login",
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').notEmpty(),
    validateRequest
  ],
  loginUser
);

export default userRouter;