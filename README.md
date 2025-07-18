# BlueGuard AI - Illegal Fishing Detection

## Overview

BlueGuard AI is a comprehensive maritime surveillance system designed to detect illegal fishing activities by combining advanced AI behavior classification with geospatial zone‑violation detection. The system consists of a **FastAPI** backend serving machine‑learning models and geospatial analysis, and a **React (Vite)** frontend providing an interactive user interface.

---

## Project Setup

### Clone the repository

```bash
git clone https://github.com/SyedAejazAhmed/matsyan-BlueGuard-AI.git
cd matsyan-BlueGuard-AI
```

---

## Project Structure

| Folder                | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| **FastAPI_Backend/**  | Backend API server (prediction, zone check, vessel analysis, AIS upload) |
| **frontend/**         | React + Vite UI                                                          |
| **model/**            | Machine‑learning models & utilities                                      |
| **geospatial/**       | Zone‑violation detection modules                                         |
| **data/**             | Sample & input data files                                                |

---

## Prerequisites

* **Python 3.8+** # Recommended Python version 3.11.9
* **Node.js 16+** # Recommended Node version v22.16.0
* **npm** or **yarn** # Recommended npm version 10.9.2

---

## Backend Setup (without Docker)

```bash
# 1. Create & activate virtual env
python -m venv venv
source venv/bin/activate # For Linux and macOS    

venv\Scripts\activate  # For Windows
# 2. Install dependencies
pip install -r requirements.txt

# 3. Run FastAPI server
uvicorn FastAPI_Backend.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Frontend Setup (without Docker)

```bash
cd frontend
npm install
npm run dev          # Opens on http://localhost:8080
```

---

## Environment Variables

* Frontend uses **Vite** env variables prefixed with `VITE_`.
* Backend settings can be tuned in `FastAPI_Backend/main.py` (CORS, etc.).

---

## 🐳 Docker Deployment

### Prereqs

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/)

### Quick Start

```bash
git clone https://github.com/SyedAejazAhmed/matsyan-BlueGuard-AI.git
cd matsyan-BlueGuard-AI
docker compose up --build
```

### Access

* 🌐 Frontend → [http://localhost:8080](http://localhost:8080)
* 🔌 Backend API → [http://localhost:8000/docs](http://localhost:8000/docs)

### Folder Volumes in Docker

| Host Path               | Container Path  | Purpose                   |
| ----------------------- | --------------- | ------------------------- |
| `FastAPI_Backend/`      | `/app`          | FastAPI backend           |
| `frontend/`             | `/app`          | React UI                  |
| `model/`, `geospatial/` | mounted volumes | Models & geospatial logic |

---

## Usage

### Frontend Pages

* **Home** – Overview & features
* **Predict** – Vessel behavior prediction
* **Zone Detection** – Protected‑zone check
* **Analyzer** – Full vessel analysis
* **About** – Project details

### Key Backend Endpoints

| Route                  | Method | Purpose              |
| ---------------------- | ------ | -------------------- |
| `/api/predict/`        | POST   | Behavior prediction  |
| `/api/check-zone/`     | POST   | Zone‑violation check |
| `/api/analyze-vessel/` | POST   | Full analysis        |
| `/api/upload-ais/`     | POST   | Upload AIS CSV       |
| `/health`              | GET    | Health probe         |

---

## Testing

* Use **Swagger** at `/docs` or **Postman/Curl** for backend routes.
* Verify frontend pages call backend successfully (watch dev console).

---

## Troubleshooting

| Issue               | Fix                                            |
| ------------------- | ---------------------------------------------- |
| Frontend env errors | Ensure `.env` files & `import.meta.env` usage  |
| Build cache issues  | Delete `node_modules/.vite` then `npm run dev` |
| CORS errors         | Adjust CORS settings in `main.py`              |

---

## License

MIT – see [LICENSE.md](LICENSE.md) for full text.

---

## Contact

Questions or support? Open an issue or reach out to the BlueGuard AI development team.
