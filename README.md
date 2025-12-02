# Quick Bite

A lightweight full-stack food-ordering project with a chatbot assistant. The repository includes a Node.js/Express backend, a Vite + React frontend, and an admin frontend. A small chatbot model and training artifacts are included under the backend models folder for local experiments.

## Project Structure

- `backend/` — Express API, controllers, models, routes and a local chatbot model under `backend/models/chatbot_model`.
- `frontend/` — Customer-facing React app (Vite).
- `admin/` — Admin React app (Vite) for managing restaurants/orders.
- `enhanced_chatbot_dataset.csv` / `enhanced_chatbot_dataset.json` — Chatbot training / dataset files.
- `chatbot_data_generation.py` — Script used to prepare or augment chatbot datasets.

## Requirements

- Node.js (>= 16 recommended)
- npm (or yarn)
- Optional: Python 3 for dataset scripts and model-related experimentation

## Setup & Run

Open a terminal for each app (backend, frontend, admin) and run the basic install + dev start steps.

Backend (API):
```cmd
cd backend
npm install
npm run dev
```

Frontend (Customer):
```cmd
cd frontend
npm install
npm run dev
```

Admin Frontend:
```cmd
cd admin
npm install
npm run dev
```

Notes:
- Scripts may differ depending on the `package.json` in each folder. If `npm run dev` does not exist, try `npm start` or inspect the `scripts` section in that folder's `package.json`.
- The backend expects environment variables (see `.env` in `backend/` or `config/db.js` for DB connection). Create a `.env` file in `backend/` if necessary.

## Chatbot Model

- A local model and checkpoints are stored in `backend/models/chatbot_model/`. This is intended for experiments and local inference/testing, not production deployment.
- Use `chatbot_data_generation.py` and the dataset files to retrain or expand conversational examples.

## Tests

- If tests exist, run them from the relevant package folder (e.g., `backend`):
```cmd
cd backend
npm test
```

## Contributing

- Create issues or PRs for bugs, feature requests, or documentation improvements.
- For code changes, follow the existing project conventions and run lint/tests before submitting.

## Contact

- For questions about running the project or the chatbot model, open an issue or contact the repository owner.

---
Generated README created by project helper script. Review and adjust environment and script commands to match your local `package.json` scripts.
