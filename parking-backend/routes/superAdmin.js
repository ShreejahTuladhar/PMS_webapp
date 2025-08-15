const express = require("express");
const { body } = require("express-validator");
const { authenticateToken, requireRole } = require("../middleware/auth");
const systemHealthService = require("../services/systemHealthService");
const auditService = require("../services/auditService");
const {
  getSystemStats,
  getRealTimeMetrics,
  getUserStats,
  getLocationStats,
  getRevenueStats,
  getSystemAlerts,
  getRecentActivity,
  getSystemLogs,
  bulkUserOperations
} = require("../controllers/superAdminController");

const router = express.Router();

// Middleware to ensure only super admins can access these routes
router.use(authenticateToken);
router.use(requireRole("super_admin"));

// System Overview Routes
router.get("/system-stats", getSystemStats);
router.get("/real-time-metrics", getRealTimeMetrics);
router.get("/system-health", async (req, res) => {
  try {
    const health = await systemHealthService.getSystemHealth();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching system health",
      error: error.message
    });
  }
});

// Statistics Routes
router.get("/user-stats", getUserStats);
router.get("/location-stats", getLocationStats);
router.get("/revenue-stats", getRevenueStats);
router.get("/alerts", getSystemAlerts);
router.get("/recent-activity", getRecentActivity);

// System Logs Routes
router.get("/logs", getSystemLogs);
router.get("/audit-logs", async (req, res) => {
  try {
    const filters = {
      action: req.query.action,
      resource: req.query.resource,
      userId: req.query.userId,
      severity: req.query.severity,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const result = await auditService.getLogs(filters);
    
    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching audit logs",
      error: error.message
    });
  }
});

router.get("/audit-statistics", async (req, res) => {
  try {
    const { period = "7d" } = req.query;
    const stats = await auditService.getStatistics(period);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching audit statistics",
      error: error.message
    });
  }
});

// Performance Metrics Routes
router.get("/performance-metrics", async (req, res) => {
  try {
    const { hours = 1 } = req.query;
    const metrics = systemHealthService.getPerformanceMetrics(parseInt(hours));
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching performance metrics",
      error: error.message
    });
  }
});

// Bulk Operations Routes
router.post("/bulk-operations/users", [
  body("operation")
    .isIn(["activate", "deactivate", "update_role"])
    .withMessage("Invalid operation"),
  body("userIds")
    .isArray({ min: 1 })
    .withMessage("User IDs array is required"),
  body("updateData.role")
    .optional()
    .isIn(["customer", "parking_admin", "super_admin"])
    .withMessage("Invalid role")
], bulkUserOperations);

// System Management Routes
router.post("/system/maintenance", async (req, res) => {
  try {
    const { enable, message } = req.body;
    
    // Log the maintenance mode change
    await auditService.logAdminAction(req.user.id, "maintenance_mode_toggle", "system", {
      userRole: req.user.role,
      description: `Maintenance mode ${enable ? "enabled" : "disabled"}: ${message || "No message"}`,
      metadata: {
        ip: req.ip,
        userAgent: req.get("User-Agent")
      }
    });
    
    // In a real implementation, you would update system configuration
    res.json({
      success: true,
      message: `Maintenance mode ${enable ? "enabled" : "disabled"}`,
      data: {
        maintenanceMode: enable,
        message: message || null,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling maintenance mode",
      error: error.message
    });
  }
});

router.post("/system/backup", async (req, res) => {
  try {
    // Log the backup request
    await auditService.logAdminAction(req.user.id, "system_backup_requested", "system", {
      userRole: req.user.role,
      description: "Manual system backup requested",
      metadata: {
        ip: req.ip,
        userAgent: req.get("User-Agent")
      }
    });
    
    // In a real implementation, you would trigger the backup process
    res.json({
      success: true,
      message: "Backup process initiated",
      data: {
        backupId: `backup_${Date.now()}`,
        status: "initiated",
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error initiating backup",
      error: error.message
    });
  }
});

router.post("/system/cleanup", async (req, res) => {
  try {
    const { type, daysToKeep = 90 } = req.body;
    
    let cleanupResult = {};
    
    if (type === "audit_logs" || type === "all") {
      const deletedCount = await auditService.cleanupOldLogs(daysToKeep);
      cleanupResult.auditLogs = deletedCount;
    }
    
    // Log the cleanup action
    await auditService.logAdminAction(req.user.id, "system_cleanup", "system", {
      userRole: req.user.role,
      description: `System cleanup performed: ${type}, kept ${daysToKeep} days`,
      changes: {
        after: cleanupResult
      },
      metadata: {
        ip: req.ip,
        userAgent: req.get("User-Agent")
      }
    });
    
    res.json({
      success: true,
      message: "System cleanup completed",
      data: cleanupResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error performing system cleanup",
      error: error.message
    });
  }
});

// Export Routes
router.get("/export/audit-logs", async (req, res) => {
  try {
    const filters = {
      action: req.query.action,
      resource: req.query.resource,
      severity: req.query.severity,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const exportData = await auditService.exportLogs(filters);
    
    // Log the export action
    await auditService.logAdminAction(req.user.id, "audit_logs_exported", "audit", {
      userRole: req.user.role,
      description: "Audit logs exported to CSV",
      metadata: {
        filters: filters,
        recordCount: exportData.rows.length,
        ip: req.ip,
        userAgent: req.get("User-Agent")
      }
    });
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error exporting audit logs",
      error: error.message
    });
  }
});

// Search Routes
router.get("/search/audit-logs", async (req, res) => {
  try {
    const { q: searchTerm, ...filters } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term is required"
      });
    }
    
    const results = await auditService.searchLogs(searchTerm, filters);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching audit logs",
      error: error.message
    });
  }
});

// Security Monitoring Routes
router.get("/security/critical-activities", async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const activities = await auditService.getCriticalActivities(parseInt(limit));
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching critical activities",
      error: error.message
    });
  }
});

router.get("/security/alerts", async (req, res) => {
  try {
    // Get security-related audit logs with high/critical severity
    const securityAlerts = await auditService.getLogs({
      resource: "security",
      severity: ["high", "critical"],
      limit: 50
    });
    
    res.json({
      success: true,
      data: securityAlerts.logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching security alerts",
      error: error.message
    });
  }
});

// Configuration Routes
router.get("/config", async (req, res) => {
  try {
    // Return system configuration (sanitized)
    const config = {
      database: {
        host: process.env.MONGODB_HOST || "localhost",
        name: process.env.MONGODB_NAME || "parksathi"
      },
      server: {
        nodeVersion: process.version,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development"
      },
      monitoring: {
        healthCheckInterval: 30000,
        metricsRetention: 100
      }
    };
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching system configuration",
      error: error.message
    });
  }
});

// Error handling middleware specific to super admin routes
router.use((error, req, res, next) => {
  console.error("Super Admin Route Error:", error);
  
  // Log the error
  auditService.logSystemAction("route_error", "super_admin", {
    severity: "high",
    status: "failure",
    description: `Error in super admin route: ${error.message}`,
    metadata: {
      route: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent")
    }
  });
  
  res.status(500).json({
    success: false,
    message: "Internal server error in super admin module",
    error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
  });
});

module.exports = router;