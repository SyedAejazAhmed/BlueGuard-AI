FROM python:3.11-slim

WORKDIR /app

# Now Docker can access the root-level requirements.txt
COPY requirements.txt ./requirements.txt

RUN pip install --upgrade pip && pip install -r requirements.txt

COPY FastAPI_Backend .  
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
