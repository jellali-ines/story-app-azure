# ========== STAGE 1: Build ==========
FROM node:20-alpine AS builder

WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت كل dependencies (dev + prod) للـ build
RUN npm ci --legacy-peer-deps

# نسخ الكود
COPY . .

# إعداد متغيرات البيئة للـ build
ARG VITE_API_URL
ARG VITE_AI_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL

# Build مشروع Vite
RUN npm run build

# ========== STAGE 2: Production مع Nginx ==========
FROM nginx:alpine AS production

# نسخ الملفات المبنية
COPY --from=builder /app/dist /usr/share/nginx/html

# نسخ config Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
