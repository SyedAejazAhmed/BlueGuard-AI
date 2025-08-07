FROM python:3.11-slim

# Set working directory to /app
WORKDIR /app

# Copy requirements and install dependencies
COPY ../requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy backend code
COPY . ./FastAPI_Backend

# Copy shared folders
COPY ../model ./model
COPY ../geospatial ./geospatial

# Set PYTHONPATH so Python can resolve imports from /app
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Run the FastAPI app
CMD ["uvicorn", "FastAPI_Backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]