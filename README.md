#  Quick Bite

A food-ordering web application with an integrated chatbot system. This repository contains:

* Customer-facing app (React + Vite)
* Admin dashboard (React + Vite)
* REST API backend (Express + MongoDB)
* Local **chatbot intent classifier**

Includes: chatbot dataset generator, training scripts, model artifacts, and storage for chat sessions.

---

## 📂 Project Overview

### Core Modules

| Component                      | Folder      | Description                                                                 |
| ------------------------------ | ----------- | --------------------------------------------------------------------------- |
| **Customer Frontend**          | `frontend/` | React + Vite app for browsing food, ordering, chatbot, cart, etc.           |
| **Admin Dashboard**            | `admin/`    | Admin interface to manage restaurants, food items, orders, chatbot UI.      |
| **Backend API**                | `backend/`  | Express + MongoDB REST API with authentication, food, orders, chatbot, etc. |
| **Chatbot Training Utilities** | Root files  | `chatbot_data_generation.py`, `model.py`, datasets.                         |

---

## ⚡ Quick Links (Most Important Files)

### 📌 Backend

* **Server entry** — [`backend/server.js`](backend/server.js)
* **Database config** — [`backend/config/db.js`](backend/config/db.js)
* **Chatbot controller** — [`chatbotController.loadModel`](backend/Controllers/chatbotController.js)
* **Chatbot routes** — [`backend/Routes/chatbotRoutes.js`](backend/Routes/chatbotRoutes.js)
* **Local model tester** — [`backend/test_model_simple.js`](backend/test_model_simple.js)
* **Model copy helper** — [`backend/copy_model_files.js`](backend/copy_model_files.js)

### 🤖 Chatbot Model Files

Stored in:

```
backend/models/chatbot_model/
```

Includes tokenizer, config, weight files, etc.

### 💬 Frontend / Admin Chatbot UI

* **Customer Chatbot:**

  * [`frontend/src/components/Chatbot/Chatbot.jsx`](frontend/src/components/Chatbot/Chatbot.jsx)
  * [`frontend/src/components/Chatbot/Chatbot.css`](frontend/src/components/Chatbot/Chatbot.css)

* **Admin Chatbot:**

  * [`admin/src/components/Chatbot/Chatbot.jsx`](admin/src/components/Chatbot/Chatbot.jsx)
  * [`admin/src/components/Chatbot/Chatbot.css`](admin/src/components/Chatbot/Chatbot.css)

### 📊 Dataset Files

* [`enhanced_chatbot_dataset.csv`](enhanced_chatbot_dataset.csv)
* [`enhanced_chatbot_dataset.json`](enhanced_chatbot_dataset.json)

---

## 📦 Requirements

* **Node.js v14+**
* **npm**
* **MongoDB** (Local or Atlas)
* Optional:

  * **Python**, **PyTorch**, **Transformers** (for re-training model)

---

# 🚀 Setup (Local Development)

## 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Copy or create `.env` → see `backend/.env` template.

Start server:

```bash
npm run server
```

---

## 2️⃣ Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

---

## 3️⃣ Customer Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🤖 Chatbot Notes

* Backend loads classifier from:

```
backend/models/chatbot_model/
```

Loader implementation:

👉 [`loadModel`](backend/Controllers/chatbotController.js)

### Fallback Behavior

If model files are missing → system uses **enhanced keyword-based fallback**.

### Test Model Paths

Run:

```bash
node backend/test_model_simple.js
```

### Regenerate dataset

Use:

* [`chatbot_data_generation.py`](chatbot_data_generation.py)

Train/evaluate model with:

* [`model.py`](model.py)

---

# 📡 API Reference

### Base URL

All endpoints are mounted under:

```
/api
```

Defined in `backend/server.js`.

---

## 1) 👤 User API

| Method | Endpoint              | Description                |
| ------ | --------------------- | -------------------------- |
| POST   | `/api/users/register` | Register new user          |
| POST   | `/api/users/login`    | Login (returns JWT)        |
| GET    | `/api/users/profile`  | Get logged-in user profile |
| GET    | `/api/users/:id`      | Fetch user by id           |
| PUT    | `/api/users/:id`      | Update user                |

---

## 2) 🍽️ Restaurants API

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| GET    | `/api/restaurants`     | Get all restaurants |
| GET    | `/api/restaurants/:id` | Restaurant details  |
| POST   | `/api/restaurants`     | Create (admin)      |
| PUT    | `/api/restaurants/:id` | Update              |
| DELETE | `/api/restaurants/:id` | Delete              |

---

## 3) 🍔 Food Menu API

| Method | Endpoint        |
| ------ | --------------- |
| GET    | `/api/food`     |
| GET    | `/api/food/:id` |
| POST   | `/api/food`     |
| PUT    | `/api/food/:id` |
| DELETE | `/api/food/:id` |

---

## 4) 🧾 Orders API

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| POST   | `/api/orders`              | Place order         |
| GET    | `/api/orders/:id`          | Get order           |
| GET    | `/api/orders/user/:userId` | User orders         |
| PUT    | `/api/orders/:id`          | Update order status |

---

## 5) 🛒 Cart API

| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/cart/:userId` | User cart         |
| POST   | `/api/cart`         | Add item          |
| PUT    | `/api/cart/:cartId` | Update quantities |
| DELETE | `/api/cart/:cartId` | Remove cart/item  |

---

## 6) 🤖 Chatbot + Chat Sessions

| Method | Endpoint                    | Description                   |
| ------ | --------------------------- | ----------------------------- |
| POST   | `/api/chatbot`              | Send message → returns intent |
| GET    | `/api/chatbot/model-status` | Check if model loaded         |

### Chat Storage

* GET → `/api/chat/sessions`
* POST → `/api/chat/sessions`
* GET → `/api/chat/sessions/:id/messages`
* POST → `/api/chat/sessions/:id/messages`

---

# 📝 Notes

* Exact routes & auth rules are in:
  `backend/Routes/*.js`
* Protected routes require:

```
Authorization: Bearer <token>
```

Middleware:
`backend/Middleware/auth.js`

---

# 🗂 Project Structure (Top-Level)

```
backend/   – API, models, chatbot model
admin/     – Admin dashboard
frontend/  – Customer app
chatbot_data_generation.py
model.py
enhanced_chatbot_dataset.*
```

---

# 🔧 Common Developer Tasks

* Update chatbot model files → place them in:

```
backend/models/chatbot_model/
```

* Inspect chat session models:

```
backend/models/chatSessionModel.js
backend/models/chatMessageModel.js
```

---

# 🤝 Contributing

1. Fork
2. Create feature branch
3. Commit
4. Open PR

---

