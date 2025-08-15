# Multi-stage Dockerfile for ParkSathi
# Author: Shreeraj Tuladhar - 1Ox4Fox LLC
# Production-ready containerization

# Frontend build stage
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY parking-frontend/package*.json ./

# Install dependencies with npm ci for faster, reliable builds
RUN npm ci --only=production && npm cache clean --force

# Copy frontend source code
COPY parking-frontend/ ./

# Build the frontend application
RUN npm run build

# Backend build stage
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY parking-backend/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy backend source code
COPY parking-backend/ ./

# Production stage
FROM node:18-alpine AS production

# Install system dependencies and security updates
RUN apk update && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S parksathi && \
    adduser -S parksathi -u 1001

# Set working directory
WORKDIR /app

# Copy backend from builder stage
COPY --from=backend-builder --chown=parksathi:parksathi /app/backend ./backend

# Copy frontend build from builder stage
COPY --from=frontend-builder --chown=parksathi:parksathi /app/frontend/dist ./frontend/dist

# Copy additional configuration files
COPY --chown=parksathi:parksathi docker-entrypoint.sh ./
COPY --chown=parksathi:parksathi healthcheck.js ./

# Make scripts executable
RUN chmod +x docker-entrypoint.sh

# Install PM2 for production process management
RUN npm install -g pm2

# Create PM2 ecosystem file
RUN echo 'module.exports = { \
  apps: [{ \
    name: "parksathi-backend", \
    script: "./backend/server.js", \
    instances: "max", \
    exec_mode: "cluster", \
    env: { \
      NODE_ENV: "production", \
      PORT: 3000 \
    }, \
    error_file: "/app/logs/err.log", \
    out_file: "/app/logs/out.log", \
    log_file: "/app/logs/combined.log", \
    time: true, \
    max_memory_restart: "1G", \
    node_args: "--max-old-space-size=1024" \
  }] \
}' > ecosystem.config.js

# Create logs directory
RUN mkdir -p logs && chown parksathi:parksathi logs

# Switch to non-root user
USER parksathi

# Expose ports
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["./docker-entrypoint.sh"]