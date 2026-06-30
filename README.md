# 🍔 Quick Bite — Food Delivery Platform

A full-stack food delivery web application built with the **MERN stack** (MongoDB, Express, React, Node.js). Includes a customer-facing app, admin dashboard, REST API backend, and an integrated NLP chatbot.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Admin Dashboard](#2-admin-dashboard)
  - [3. Customer Frontend](#3-customer-frontend)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [API Docs (Swagger UI)](#api-docs-swagger-ui)
- [Security](#security)
- [Chatbot System](#chatbot-system)
- [Contributing](#contributing)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛍️ Browse Restaurants | List, filter, and search food restaurants |
| 🍔 Food Menu | Browse menu items per restaurant with categories |
| 🛒 Cart Management | Add/remove items; cart stored on user account |
| 📦 Order Placement | Place orders with full order history |
| 💳 Stripe Payments | Secure payment processing with Stripe |
| 👤 Authentication | JWT-based user registration and login |
| 🔐 Role-Based Access | Customer vs. Admin role enforcement |
| 🤖 AI Chatbot | Intent-based chatbot with NLP fallback |
| 📚 API Docs | Full Swagger/OpenAPI documentation at `/api-docs` |
| 📑 Pagination | All list endpoints support pagination, filtering, sorting |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────┐
│                   Client Layer                    │
│  React + Vite (frontend/)   React + Vite (admin/) │
└──────────────────┬────────────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼────────────────────────────────┐
│              Express.js Backend                   │
│  Routes → Validators → Auth Middleware            │
│  Controllers → MongoDB Models (Mongoose)           │
│  Swagger UI at /api-docs                          │
└──────────────────┬────────────────────────────────┘
                   │
         ┌─────────▼─────────┐
         │   MongoDB Atlas   │
         └───────────────────┘
```

---

## 📂 Project Structure

```
quick_bite/
├── backend/                    # Express.js REST API
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── swagger.js          # OpenAPI configuration
│   ├── Controllers/            # Business logic
│   │   ├── cartController.js
│   │   ├── chatbotController.js
│   │   ├── foodController.js
│   │   ├── orderController.js
│   │   ├── restaurantController.js
│   │   └── userController.js
│   ├── Middleware/
│   │   ├── auth.js             # JWT auth, adminAuth, paymentAuth
│   │   ├── errorHandler.js     # Centralized error handling
│   │   └── validator.js        # express-validator helper
│   ├── models/                 # Mongoose schemas
│   │   ├── cartModel.js
│   │   ├── foodModel.js
│   │   ├── orderModel.js
│   │   ├── restaurantModel.js
│   │   └── userModel.js
│   ├── Routes/                 # Express routes with Swagger JSDoc
│   │   ├── cartRoutes.js
│   │   ├── chatbotRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── restaurantRoutes.js
│   │   └── userRoutes.js
│   ├── Utils/
│   │   └── queryHelper.js      # Pagination, filtering, sorting
│   ├── .env.example            # Environment variable template
│   ├── package.json
│   └── server.js               # App entry point
├── frontend/                   # Customer React app
├── admin/                      # Admin React dashboard
├── chatbot_data_generation.py  # Chatbot dataset generator
├── model.py                    # Chatbot model training
└── README.md                   # This file
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | MongoDB (Mongoose 7.x) |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Passwords | bcrypt |
| Validation | express-validator |
| Payments | Stripe |
| API Docs | swagger-jsdoc + swagger-ui-express |
| Chatbot | @xenova/transformers + node-nlp |
| Frontend | React 18 + Vite |

---

## ⚙️ Prerequisites

- **Node.js v18+** and **npm v9+**
- **MongoDB** (Atlas cloud or local instance)
- **Stripe account** (for payment processing — test keys work)
- Optional: **Python 3.9+**, PyTorch, Transformers (for retraining chatbot)

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY
```

Start in development mode (with auto-reload via nodemon):

```bash
npm run server
```

Start in production mode:

```bash
npm start
```

The server starts at **http://localhost:5001**.

> **API Docs** available at **http://localhost:5001/api-docs**

---

### 2. Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

Admin panel starts at **http://localhost:5174** (or next available port).

---

### 3. Customer Frontend

```bash
cd frontend
npm install
npm run dev
```

Customer app starts at **http://localhost:5173**.

---

## 🔑 Environment Variables

All backend environment variables are defined in `backend/.env.example`.

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5001) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGO_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | Secret for signing JWT tokens |
| `JWT_EXPIRE` | No | Token expiry (default: `1h`) |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe secret key |
| `FRONTEND_URL` | No | Frontend URL for Stripe redirects (default: `http://localhost:5173`) |

---

## 📡 API Reference

> All endpoints are prefixed with `/api`. For interactive docs, see [Swagger UI](#api-docs-swagger-ui).

### 👤 Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users/register` | None | Register a new user |
| `POST` | `/api/users/login` | None | Login and get JWT token |

**Register — Example Request:**
```json
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Register — Example Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### 🍽️ Restaurants

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/restaurants/list` | None | List all restaurants (paginated) |
| `GET` | `/api/restaurants/:id` | None | Get single restaurant |
| `POST` | `/api/restaurants/add` | Admin | Create a restaurant |
| `PUT` | `/api/restaurants/:id` | Admin | Update a restaurant |
| `DELETE` | `/api/restaurants/:id` | Admin | Delete a restaurant |

**List — Query Parameters (all optional):**

| Param | Type | Example | Description |
|---|---|---|---|
| `page` | number | `?page=2` | Page number (default: 1) |
| `limit` | number | `?limit=10` | Items per page (default: 10) |
| `sortBy` | string | `?sortBy=name` | Field to sort by |
| `order` | string | `?order=asc` | `asc` or `desc` (default: `desc`) |
| `search` | string | `?search=pizza` | Search by name |

---

### 🍔 Food

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/foods/list` | None | List all food items (paginated) |
| `GET` | `/api/foods/:id` | None | Get single food item |
| `GET` | `/api/foods/restaurant/:restaurantId` | None | Get all food for a restaurant |
| `POST` | `/api/foods/add` | Admin | Add a food item |
| `PUT` | `/api/foods/:id` | Admin | Update a food item |
| `DELETE` | `/api/foods` | Admin | Remove a food item (id in body) |

---

### 🛒 Cart

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/cart/add` | JWT | Add item to cart |
| `POST` | `/api/cart/remove` | JWT | Remove item from cart |
| `POST` | `/api/cart/get` | JWT | Get cart contents |

**Add to Cart — Example Request:**
```json
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "64abc123...",
  "itemId": "64def456..."
}
```

---

### 📦 Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders/place` | JWT | Place order with online payment |
| `POST` | `/api/orders/placecod` | JWT | Place Cash on Delivery order |
| `POST` | `/api/orders/verify` | Payment | Verify Stripe payment result |
| `POST` | `/api/orders/userorders` | JWT | Get user's order history |
| `GET` | `/api/orders/list` | Admin | List all orders (paginated) |
| `POST` | `/api/orders/status` | Admin | Update order status |

**Place Order — Example Request:**
```json
POST /api/orders/place
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "64abc123...",
  "items": [
    { "_id": "64def456...", "name": "Burger", "price": 150, "quantity": 2 }
  ],
  "amount": 350,
  "address": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "MH",
    "zipcode": "400001",
    "country": "India",
    "phone": "9876543210"
  }
}
```

---

### 🤖 Chatbot

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chatbot/admin/message` | Admin | Admin chatbot — intent classification with DB operations |
| `POST` | `/api/chatbot/customer/message` | None | Customer chatbot — NLP search and order awareness |
| `GET` | `/api/chatbot/history/:sessionId` | None | Get chat history for a session (last 50 messages) |

**Customer Chatbot — Example Request:**
```json
POST /api/chatbot/customer/message
Content-Type: application/json

{
  "message": "What restaurants are available?",
  "sessionId": "session_abc123",
  "userId": "64abc123..."
}
```

---

## 📚 API Docs (Swagger UI)

Interactive API documentation is available when the backend is running:

> **http://localhost:5001/api-docs**

Features:
- Browse all endpoints organized by tag (Users, Restaurants, Food, Cart, Orders, Chatbot)
- Try requests directly from the browser
- View request/response schemas and examples
- Authenticate using the **Authorize** button with a Bearer JWT token

---

## 🔐 Security

### Authentication Flow

1. Call `POST /api/users/login` with `{email, password}`
2. Receive a **JWT token** in the response
3. Include the token in all protected requests:

```http
Authorization: Bearer <your_jwt_token>
```

### Middleware Layers

| Middleware | File | Applied To |
|---|---|---|
| `authMiddleware` | `Middleware/auth.js` | All user-protected routes |
| `adminAuth` | `Middleware/auth.js` | Admin-only operations (CRUD restaurants, food, order status) |
| `paymentAuth` | `Middleware/auth.js` | Payment verification endpoint |

### Roles

| Role | Access |
|---|---|
| `customer` | Browse, cart, orders, chatbot |
| `admin` | Everything + restaurant/food management, all order operations |

> Set a user's role directly in MongoDB or via admin tooling. On registration, all users default to `customer`.

---

## 🤖 Chatbot System

The chatbot uses a two-tier approach:

1. **Primary**: `@xenova/transformers` — a local ML model for intent classification
2. **Fallback**: Enhanced keyword-based matching via `node-nlp`

### Model Location

```
backend/models/chatbot_model/
```

The model is loaded at startup. If model files are missing, the system automatically falls back to keyword matching — the API never fails.

### Retrain the Model

Generate a new dataset:
```bash
python chatbot_data_generation.py
```

Train and evaluate:
```bash
python model.py
```

Place the output artifacts in `backend/models/chatbot_model/`.

---

## 📊 Standard API Response Format

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Paginated List:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "name is required, email must be a valid email",
  "errors": [
    { "field": "name", "msg": "name is required" },
    { "field": "email", "msg": "email must be a valid email" }
  ]
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📝 License

This project is for educational purposes.
