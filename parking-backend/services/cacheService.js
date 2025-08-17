/**
 * Redis Cache Service for ParkSathi
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * High-performance caching layer for parking data optimization
 */

const redis = require('redis');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.defaultTTL = 3600; // 1 hour
    }

    async connect() {
        try {
            this.client = redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        return new Error('Redis server connection refused');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        return new Error('Retry time exhausted');
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            await this.client.connect();
            this.isConnected = true;
            console.log('✅ Redis cache service connected successfully');
        } catch (error) {
            console.error('❌ Redis connection failed:', error.message);
            this.isConnected = false;
        }
    }

    async set(key, value, ttl = this.defaultTTL) {
        if (!this.isConnected) return false;
        
        try {
            const serializedValue = JSON.stringify(value);
            await this.client.setEx(key, ttl, serializedValue);
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    async get(key) {
        if (!this.isConnected) return null;
        
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async del(key) {
        if (!this.isConnected) return false;
        
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    async exists(key) {
        if (!this.isConnected) return false;
        
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    // Parking-specific cache methods
    async cacheAvailableSpaces(locationId, spaces, ttl = 300) {
        const key = `parking:available:${locationId}`;
        return await this.set(key, spaces, ttl);
    }

    async getAvailableSpaces(locationId) {
        const key = `parking:available:${locationId}`;
        return await this.get(key);
    }

    async cacheSearchResults(searchParams, results, ttl = 600) {
        const key = `search:${Buffer.from(JSON.stringify(searchParams)).toString('base64')}`;
        return await this.set(key, results, ttl);
    }

    async getSearchResults(searchParams) {
        const key = `search:${Buffer.from(JSON.stringify(searchParams)).toString('base64')}`;
        return await this.get(key);
    }

    async cacheUserSession(userId, sessionData, ttl = 7200) {
        const key = `session:${userId}`;
        return await this.set(key, sessionData, ttl);
    }

    async getUserSession(userId) {
        const key = `session:${userId}`;
        return await this.get(key);
    }

    async invalidateLocationCache(locationId) {
        const patterns = [
            `parking:available:${locationId}`,
            `location:details:${locationId}`,
            `search:*` // Invalidate all search results
        ];
        
        for (const pattern of patterns) {
            if (pattern.includes('*')) {
                const keys = await this.client.keys(pattern);
                if (keys.length > 0) {
                    await this.client.del(keys);
                }
            } else {
                await this.del(pattern);
            }
        }
    }

    async disconnect() {
        if (this.client && this.isConnected) {
            await this.client.disconnect();
            this.isConnected = false;
            console.log('Redis cache service disconnected');
        }
    }
}

module.exports = new CacheService();