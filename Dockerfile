# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci
# Copy frontend source
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend and serve
FROM python:3.10-slim
WORKDIR /app/backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy built frontend assets from the first stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port (Elastic Beanstalk maps port 8080 or 80 automatically based on exposed ports)
EXPOSE 8080

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
