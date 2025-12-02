Here is an improved, polished, and **highly readable README.md** for your **Quick Bite** project.
I reorganized the content, added clarity, improved spacing, created a clean structure, and made it easy for others to understand and use your project.

---

# 🍔 Quick Bite

A lightweight **food-ordering web application** with an integrated **chatbot system**.
This repository contains:

- A **Node.js backend API**
- A **customer-facing React app**
- An **admin web dashboard**
- A **local chatbot model** with scripts for training and testing

---

## 📂 Project Structure

```
quick-bite/
├── backend/                  # Node.js Backend API
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   ├── models/chatbot_model/ # Local chatbot model + tokenizer
│   ├── test_model_simple.js
│   ├── .env
│   └── server.js
│
├── frontend/                 # Customer-facing React app (Vite)
│   ├── src/
│   └── vite.config.js
│
└── admin/                    # Admin dashboard (React + Vite)
    ├── src/
    └── vite.config.js

Root Files:
- chatbot_data_generation.py
- enhanced_chatbot_dataset.csv
- enhanced_chatbot_dataset.json
- Additional helper scripts
```

---

## 🚀 Quick Start

### ✅ Prerequisites

- **Node.js v16+**
- npm (bundled with Node.js)

Install dependencies for each module you want to run:

```bash
npm install
```

Run this inside **backend**, **frontend**, and **admin** folders.

---

# 🖥 Backend Setup

### 1️⃣ Navigate to backend

```bash
cd backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start the server

```bash
node server.js
# or
npm run start
```

💡 Configure variables inside the `backend/.env` file (create one if missing).

---

# 🌐 Frontend (Customer App)

```bash
cd frontend
npm install
npm run dev
```

Vite will start the dev server (usually):

👉 [http://localhost:5173](http://localhost:5173)

---

# 🛠 Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

The admin app runs on a different Vite port (e.g., 5174).

---

## 🤖 Chatbot & Model Files

- Chatbot model files live in:

```
backend/models/chatbot_model/
```

Includes:

- tokenizer files
- model configuration
- weights (may be large — handle with care)

### To test chatbot integration:

```bash
node backend/test_model_simple.js
```

---

## 🗂 Important Folders

| Component           | Path                       |
| ------------------- | -------------------------- |
| API Routes          | `backend/Routes/`          |
| Controllers         | `backend/Controllers/`     |
| Mongo Models        | `backend/models/`          |
| User App Components | `frontend/src/components/` |
| User App Pages      | `frontend/src/pages/`      |
| Admin App Source    | `admin/src/`               |

---

## 🧑‍💻 Development Notes

- Keep **backend**, **frontend**, and **admin** running in separate terminals while coding.
- Large model files should be added to `.gitignore` if not required in version control.
- If the chatbot model changes, ensure matching tokenizer + config files.

---

## 🧪 Testing

Test scripts and evaluation outputs can be found in:

```
backend/models/
```

Files include:

- `test_results.txt`
- `classification_report.txt`

You may extend them with additional testing scripts.

---

## 🤝 Contributing

1. Fork this repository
2. Create a new feature branch
3. Add your changes + tests
4. Submit a pull request
