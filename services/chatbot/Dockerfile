# ===================================
# Dockerfile pour AI Backend Flask (Sans Ollama intégré)
# Note: Ollama doit tourner dans un conteneur séparé
# ===================================
FROM python:3.9-slim

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements.txt et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY app.py .

# Exposer le port
EXPOSE 5002

# Variables d'environnement
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
# ⚠️ Ollama doit être accessible via réseau Docker ou externe
ENV OLLAMA_URL=http://ollama:11434/api/generate
ENV MODEL_NAME=llama2-7b-mini

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5002/api/health || exit 1

# Démarrer l'application
CMD ["python", "app.py"]