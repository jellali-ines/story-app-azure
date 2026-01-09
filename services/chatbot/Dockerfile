# ===================================
# Dockerfile for Chatbot Service with Monitoring
# ===================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY monitoring.py .

# Expose port
EXPOSE 5002

# Environment variables (will be overridden by Azure)
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Default Ollama settings (will be overridden)
ENV OLLAMA_URL=http://ollama-vm:11434/api/generate
ENV MODEL_NAME=llama3.1:8b
ENV OLLAMA_TIMEOUT=300
ENV MAX_REQUESTS_PER_MINUTE=30
ENV MAX_REQUESTS_PER_DAY=1000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5002/api/health || exit 1

# Run with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "--workers", "4", "--threads", "2", "--timeout", "300", "--access-logfile", "-", "--error-logfile", "-", "app:app"]