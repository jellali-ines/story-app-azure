# ===================================
# Backend Node.js - Production Dockerfile
# ===================================

FROM node:18-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    curl \
    tini

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# ========== STAGE 1: Dependencies ==========
FROM base AS dependencies

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (dev + prod) pour le build
RUN npm ci

# ========== STAGE 2: Build ==========
FROM base AS build

WORKDIR /app

# Copier les dépendances depuis l'étape précédente
COPY --from=dependencies /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Build si nécessaire (par exemple TypeScript)
# RUN npm run build

# ========== STAGE 3: Production ==========
FROM base AS production

WORKDIR /app

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copier le code depuis l'étape build
COPY --from=build /app .

# Changer la propriété des fichiers
RUN chown -R nodejs:nodejs /app

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    PORT=5000 \
    NPM_CONFIG_LOGLEVEL=warn

# Healthcheck
HEALTHCHECK --interval=30s \
    --timeout=3s \
    --start-period=10s \
    --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Utiliser tini pour gérer correctement les signaux
ENTRYPOINT ["/sbin/tini", "--"]

# Démarrer l'application
CMD ["node", "server.js"]