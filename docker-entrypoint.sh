#!/bin/sh
# Docker entrypoint script for ParkSathi
# Author: Shreeraj Tuladhar - 1Ox4Fox LLC

set -e

echo "🚀 Starting ParkSathi Application..."
echo "© 2025 1Ox4Fox LLC - Conceptualized by Shreeraj Tuladhar"

# Function to wait for service
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port"; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        echo "🔄 Attempt $attempt/$max_attempts: $service_name not ready, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to become ready after $max_attempts attempts"
    return 1
}

# Extract host and port from MongoDB URI
if [ -n "$MONGODB_URI" ]; then
    MONGO_HOST=$(echo "$MONGODB_URI" | sed -n 's/.*:\/\/\([^:]*\):\([0-9]*\).*/\1/p')
    MONGO_PORT=$(echo "$MONGODB_URI" | sed -n 's/.*:\/\/\([^:]*\):\([0-9]*\).*/\2/p')
    
    if [ -n "$MONGO_HOST" ] && [ -n "$MONGO_PORT" ]; then
        wait_for_service "$MONGO_HOST" "$MONGO_PORT" "MongoDB"
    fi
fi

# Extract host and port from Redis URL
if [ -n "$REDIS_URL" ]; then
    REDIS_HOST=$(echo "$REDIS_URL" | sed -n 's/.*:\/\/\([^:]*\):\([0-9]*\).*/\1/p')
    REDIS_PORT=$(echo "$REDIS_URL" | sed -n 's/.*:\/\/\([^:]*\):\([0-9]*\).*/\2/p')
    
    if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
        wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis"
    fi
fi

# Check if we're in development mode
if [ "$NODE_ENV" = "development" ]; then
    echo "🔧 Starting in development mode..."
    cd backend
    exec npm run dev
else
    echo "🏭 Starting in production mode with PM2..."
    
    # Set PM2 home directory
    export PM2_HOME=/app/.pm2
    
    # Start application with PM2
    pm2-runtime start ecosystem.config.js --env production
fi