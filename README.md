# BlueGuard AI - Illegal Fishing Detection

## Overview
BlueGuard AI is a comprehensive maritime surveillance system designed to detect illegal fishing activities by combining advanced AI behavior classification with geospatial zone violation detection. The system consists of a FastAPI backend serving machine learning models and geospatial analysis, and a React frontend providing an interactive user interface.

---

## Project Setup

### Clone the repository
```bash
git clone https://github.com/SyedAejazAhmed/matsyan-BlueGuard-AI.git
cd matsyan-BlueGuard-AI
```

---

## Project Structure

- **FastAPI_Backend/**: Backend API server with endpoints for prediction, zone checking, vessel analysis, and AIS data upload.
- **frontend/**: React frontend application built with Vite, providing UI components and pages for interacting with the system.
- **model/**: Machine learning models and utilities for vessel behavior prediction and anomaly detection.
- **geospatial/**: Geospatial analysis modules for zone violation detection.
- **data/**: Sample and input data files.

---

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

---

## Backend Setup

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI backend server:
   ```bash
   uvicorn FastAPI_Backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

---

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

4. Access the frontend UI at:
   ```
   http://localhost:8080
   ```

---

## Environment Variables

- Frontend uses Vite environment variables prefixed with `VITE_`.
- Backend configuration can be adjusted in `FastAPI_Backend/main.py` and related config files.

---

## Usage

- Use the frontend UI to navigate between pages:
  - Home: Overview and feature highlights.
  - Predict: Submit vessel data for behavior prediction.
  - Zone Detection: Check if coordinates violate protected zones.
  - Analyzer: Comprehensive vessel analysis.
  - About: Project information.

- Backend API endpoints:
  - `/api/predict/`: POST vessel data for prediction.
  - `/api/check-zone/`: POST coordinates for zone violation check.
  - `/api/analyze-vessel/`: POST vessel data for full analysis.
  - `/api/upload-ais/`: POST AIS data file upload.
  - `/health`: GET health status.

---

## Testing

- Backend endpoints can be tested using tools like Curl or Postman.
- Frontend UI can be tested by interacting with all pages and verifying API integration.
- Ensure backend server is running before starting frontend.

---

## Troubleshooting

- If frontend shows errors related to environment variables, ensure `.env` files are set correctly and use `import.meta.env` in frontend code.
- Clear frontend cache by deleting `node_modules/.vite` if build issues occur.
- Verify CORS settings in backend to allow frontend origin.

---

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

---

## Contact

For questions or support, please contact the development team.