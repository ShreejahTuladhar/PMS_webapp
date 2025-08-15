const mongoose = require("mongoose");

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  resource: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  userRole: {
    type: String,
    index: true
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ip: String,
    userAgent: String,
    location: String,
    sessionId: String
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
    index: true
  },
  status: {
    type: String,
    enum: ["success", "failure", "partial"],
    default: "success",
    index: true
  },
  details: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

class AuditService {
  constructor() {
    this.logQueue = [];
    this.isProcessing = false;
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    this.startBatchProcessor();
  }

  // Log an audit event
  async log(event) {
    try {
      const auditEntry = {
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        userId: event.userId,
        userRole: event.userRole,
        changes: event.changes,
        metadata: event.metadata || {},
        severity: event.severity || "medium",
        status: event.status || "success",
        details: event.details,
        timestamp: new Date()
      };

      // Add to queue for batch processing
      this.logQueue.push(auditEntry);

      // If high severity, process immediately
      if (event.severity === "critical" || event.severity === "high") {
        await this.processBatch();
      }

      return true;
    } catch (error) {
      console.error("Error adding audit log to queue:", error);
      return false;
    }
  }

  // Batch processor for audit logs
  async processBatch() {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batch = this.logQueue.splice(0, this.batchSize);
      
      if (batch.length > 0) {
        await AuditLog.insertMany(batch);
        console.log(`Processed ${batch.length} audit log entries`);
      }
    } catch (error) {
      console.error("Error processing audit log batch:", error);
      // Re-add failed entries back to the queue
      this.logQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  // Start the batch processor
  startBatchProcessor() {
    setInterval(() => {
      this.processBatch();
    }, this.flushInterval);
  }

  // Get audit logs with filtering
  async getLogs(filters = {}) {
    try {
      const {
        action,
        resource,
        userId,
        severity,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const query = {};

      if (action) query.action = new RegExp(action, "i");
      if (resource) query.resource = resource;
      if (userId) query.userId = userId;
      if (severity) query.severity = severity;
      if (status) query.status = status;

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate("userId", "firstName lastName email role")
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(query)
      ]);

      return {
        logs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  }

  // Get audit statistics
  async getStatistics(period = "7d") {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case "24h":
          startDate.setHours(endDate.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const [
        totalLogs,
        actionStats,
        severityStats,
        statusStats,
        userStats,
        resourceStats
      ] = await Promise.all([
        AuditLog.countDocuments({
          timestamp: { $gte: startDate, $lte: endDate }
        }),
        
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: "$action", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: "$severity", count: { $sum: 1 } } }
        ]),
        
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        
        AuditLog.aggregate([
          { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: "$resource", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      return {
        period: { startDate, endDate },
        totalLogs,
        actionStats,
        severityStats,
        statusStats,
        userStats,
        resourceStats,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error("Error fetching audit statistics:", error);
      throw error;
    }
  }

  // Get recent critical activities
  async getCriticalActivities(limit = 20) {
    try {
      const activities = await AuditLog.find({
        severity: { $in: ["high", "critical"] }
      })
        .populate("userId", "firstName lastName email")
        .sort({ timestamp: -1 })
        .limit(limit);

      return activities;
    } catch (error) {
      console.error("Error fetching critical activities:", error);
      throw error;
    }
  }

  // Clean up old logs
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await AuditLog.deleteMany({
        timestamp: { $lt: cutoffDate },
        severity: { $nin: ["high", "critical"] } // Keep high and critical logs longer
      });

      console.log(`Cleaned up ${result.deletedCount} old audit logs`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up old logs:", error);
      throw error;
    }
  }

  // Helper methods for common audit actions
  async logUserAction(userId, action, resource, details = {}) {
    return this.log({
      action,
      resource,
      resourceId: details.resourceId,
      userId,
      userRole: details.userRole,
      changes: details.changes,
      metadata: details.metadata,
      severity: details.severity || "medium",
      status: details.status || "success",
      details: details.description
    });
  }

  async logSystemAction(action, resource, details = {}) {
    return this.log({
      action,
      resource,
      resourceId: details.resourceId,
      userId: null,
      userRole: "system",
      changes: details.changes,
      metadata: details.metadata,
      severity: details.severity || "low",
      status: details.status || "success",
      details: details.description
    });
  }

  async logSecurityEvent(userId, action, details = {}) {
    return this.log({
      action,
      resource: "security",
      resourceId: details.resourceId,
      userId,
      userRole: details.userRole,
      metadata: details.metadata,
      severity: "high",
      status: details.status || "success",
      details: details.description
    });
  }

  async logAdminAction(userId, action, resource, details = {}) {
    return this.log({
      action,
      resource,
      resourceId: details.resourceId,
      userId,
      userRole: details.userRole || "admin",
      changes: details.changes,
      metadata: details.metadata,
      severity: "high",
      status: details.status || "success",
      details: details.description
    });
  }

  // Search audit logs
  async searchLogs(searchTerm, filters = {}) {
    try {
      const query = {
        $or: [
          { action: new RegExp(searchTerm, "i") },
          { resource: new RegExp(searchTerm, "i") },
          { details: new RegExp(searchTerm, "i") }
        ]
      };

      // Apply additional filters
      if (filters.severity) query.severity = filters.severity;
      if (filters.status) query.status = filters.status;
      if (filters.startDate) {
        query.timestamp = query.timestamp || {};
        query.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.timestamp = query.timestamp || {};
        query.timestamp.$lte = new Date(filters.endDate);
      }

      const logs = await AuditLog.find(query)
        .populate("userId", "firstName lastName email")
        .sort({ timestamp: -1 })
        .limit(filters.limit || 50);

      return logs;
    } catch (error) {
      console.error("Error searching audit logs:", error);
      throw error;
    }
  }

  // Export logs to CSV
  async exportLogs(filters = {}) {
    try {
      const { logs } = await this.getLogs({ ...filters, limit: 10000 });
      
      const csvHeaders = [
        "Timestamp",
        "Action",
        "Resource",
        "User",
        "Severity",
        "Status",
        "Details"
      ];

      const csvRows = logs.map(log => [
        log.timestamp.toISOString(),
        log.action,
        log.resource,
        log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : "System",
        log.severity,
        log.status,
        log.details || ""
      ]);

      return {
        headers: csvHeaders,
        rows: csvRows
      };
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      throw error;
    }
  }
}

// Create singleton instance
const auditService = new AuditService();

module.exports = auditService;