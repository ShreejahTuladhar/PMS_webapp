const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

// Basic health check
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {}
  };

  try {
    // Database check
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    };

    checks.services.database = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      state: dbStates[dbState],
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };

    // Memory check
    const memUsage = process.memoryUsage();
    checks.services.memory = {
      status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning', // 500MB threshold
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`
    };

    // System info
    checks.system = {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      cpu: process.cpuUsage()
    };

    // Overall status
    const unhealthyServices = Object.values(checks.services)
      .filter(service => service.status === 'unhealthy');
    
    if (unhealthyServices.length > 0) {
      checks.status = 'unhealthy';
      return res.status(503).json(checks);
    }

    const warningServices = Object.values(checks.services)
      .filter(service => service.status === 'warning');
    
    if (warningServices.length > 0) {
      checks.status = 'warning';
      return res.status(200).json(checks);
    }

    res.status(200).json(checks);

  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message });
    checks.status = 'unhealthy';
    checks.error = error.message;
    res.status(503).json(checks);
  }
});

// Readiness check (for container orchestration)
router.get('/ready', async (req, res) => {
  try {
    // Check if database is connected and ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        message: 'Database not connected',
        timestamp: new Date().toISOString()
      });
    }

    // Check if all required environment variables are set
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      return res.status(503).json({
        status: 'not ready',
        message: 'Missing required environment variables',
        missing: missingEnvVars,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status: 'ready',
      message: 'Service is ready to accept traffic',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({
      status: 'not ready',
      message: 'Readiness check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness check (for container orchestration)
router.get('/live', (req, res) => {
  // Simple check that the process is running
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid
  });
});

module.exports = router;