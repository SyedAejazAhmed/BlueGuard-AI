# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Copy requirements and install all dependencies
COPY requirements.txt requirements.prod.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Stage 2: Production
FROM python:3.11-slim

WORKDIR /app

# Copy only production dependencies list from builder
COPY --from=builder /app/requirements.prod.txt .

# Install production dependencies
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.prod.txt

# Copy application code from builder
COPY --from=builder /app/FastAPI_Backend ./FastAPI_Backend
COPY --from=builder /app/model ./model
COPY --from=builder /app/geospatial ./geospatial

# Set PYTHONPATH so Python can resolve imports from /app
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Run the FastAPI app
CMD ["uvicorn", "FastAPI_Backend.main:app", "--host", "0.0.0.0", "--port", "8000"]