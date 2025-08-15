const mongoose = require("mongoose");
const os = require("os");
const fs = require("fs").promises;
const path = require("path");

class SystemHealthService {
  constructor() {
    this.metrics = {
      cpu: [],
      memory: [],
      disk: [],
      network: [],
      database: []
    };
    this.alertThresholds = {
      cpu: 80,
      memory: 85,
      disk: 90,
      responseTime: 1000
    };
  }

  // Get comprehensive system health status
  async getSystemHealth() {
    try {
      const [
        cpuMetrics,
        memoryMetrics,
        diskMetrics,
        databaseMetrics,
        networkMetrics
      ] = await Promise.all([
        this.getCPUMetrics(),
        this.getMemoryMetrics(),
        this.getDiskMetrics(),
        this.getDatabaseMetrics(),
        this.getNetworkMetrics()
      ]);

      const overallStatus = this.calculateOverallStatus({
        cpu: cpuMetrics.usage,
        memory: memoryMetrics.usage,
        disk: diskMetrics.usage,
        database: databaseMetrics.responseTime
      });

      return {
        status: overallStatus.status,
        timestamp: new Date(),
        uptime: process.uptime(),
        lastRestart: new Date(Date.now() - process.uptime() * 1000),
        metrics: {
          cpu: cpuMetrics,
          memory: memoryMetrics,
          disk: diskMetrics,
          database: databaseMetrics,
          network: networkMetrics
        },
        alerts: overallStatus.alerts
      };
    } catch (error) {
      console.error("Error getting system health:", error);
      return {
        status: "error",
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  // Get CPU metrics
  async getCPUMetrics() {
    const cpus = os.cpus();
    const numCPUs = cpus.length;
    
    // Calculate CPU usage (simplified)
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / numCPUs;
    const total = totalTick / numCPUs;
    const usage = 100 - ~~(100 * idle / total);
    
    const loadAverage = os.loadavg();
    
    return {
      usage: Math.max(0, Math.min(100, usage)),
      cores: numCPUs,
      loadAverage: {
        "1m": loadAverage[0],
        "5m": loadAverage[1],
        "15m": loadAverage[2]
      },
      status: usage > this.alertThresholds.cpu ? "warning" : "healthy"
    };
  }

  // Get memory metrics
  getMemoryMetrics() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usage = (usedMemory / totalMemory) * 100;

    const processMemory = process.memoryUsage();

    return {
      total: totalMemory,
      used: usedMemory,
      free: freeMemory,
      usage: Math.round(usage * 100) / 100,
      process: {
        heapUsed: processMemory.heapUsed,
        heapTotal: processMemory.heapTotal,
        external: processMemory.external,
        rss: processMemory.rss
      },
      status: usage > this.alertThresholds.memory ? "warning" : "healthy"
    };
  }

  // Get disk metrics
  async getDiskMetrics() {
    try {
      const stats = await fs.stat(process.cwd());
      // This is a simplified disk check - in production you'd use a proper disk usage library
      const usage = Math.floor(Math.random() * 30) + 40; // Mock usage between 40-70%
      
      return {
        usage: usage,
        status: usage > this.alertThresholds.disk ? "warning" : "healthy",
        path: process.cwd()
      };
    } catch (error) {
      return {
        usage: 0,
        status: "error",
        error: error.message
      };
    }
  }

  // Get database metrics
  async getDatabaseMetrics() {
    try {
      const startTime = Date.now();
      const dbState = mongoose.connection.readyState;
      const db = mongoose.connection.db;
      
      let stats = null;
      let responseTime = Date.now() - startTime;
      
      if (dbState === 1) { // Connected
        try {
          stats = await db.stats();
          responseTime = Date.now() - startTime;
        } catch (error) {
          console.error("Error getting DB stats:", error);
        }
      }

      const connectionStatus = this.getConnectionStatus(dbState);

      return {
        connectionStatus: connectionStatus.status,
        connectionState: dbState,
        responseTime: responseTime,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        stats: stats ? {
          collections: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes
        } : null,
        status: responseTime > this.alertThresholds.responseTime ? "warning" : 
                connectionStatus.status === "Connected" ? "healthy" : "error"
      };
    } catch (error) {
      return {
        connectionStatus: "Error",
        responseTime: -1,
        status: "error",
        error: error.message
      };
    }
  }

  // Get network metrics
  getNetworkMetrics() {
    const networkInterfaces = os.networkInterfaces();
    const interfaces = [];

    for (const [name, nets] of Object.entries(networkInterfaces)) {
      for (const net of nets) {
        if (net.family === 'IPv4' && !net.internal) {
          interfaces.push({
            name: name,
            address: net.address,
            netmask: net.netmask,
            mac: net.mac
          });
        }
      }
    }

    return {
      interfaces: interfaces,
      hostname: os.hostname(),
      status: interfaces.length > 0 ? "healthy" : "warning"
    };
  }

  // Calculate overall system status
  calculateOverallStatus(metrics) {
    const alerts = [];
    let criticalCount = 0;
    let warningCount = 0;

    // Check CPU
    if (metrics.cpu > this.alertThresholds.cpu) {
      alerts.push({
        type: "cpu",
        level: metrics.cpu > 95 ? "critical" : "warning",
        message: `High CPU usage: ${metrics.cpu.toFixed(1)}%`
      });
      if (metrics.cpu > 95) criticalCount++;
      else warningCount++;
    }

    // Check Memory
    if (metrics.memory > this.alertThresholds.memory) {
      alerts.push({
        type: "memory",
        level: metrics.memory > 95 ? "critical" : "warning",
        message: `High memory usage: ${metrics.memory.toFixed(1)}%`
      });
      if (metrics.memory > 95) criticalCount++;
      else warningCount++;
    }

    // Check Disk
    if (metrics.disk > this.alertThresholds.disk) {
      alerts.push({
        type: "disk",
        level: metrics.disk > 98 ? "critical" : "warning",
        message: `High disk usage: ${metrics.disk.toFixed(1)}%`
      });
      if (metrics.disk > 98) criticalCount++;
      else warningCount++;
    }

    // Check Database Response Time
    if (metrics.database > this.alertThresholds.responseTime) {
      alerts.push({
        type: "database",
        level: metrics.database > 5000 ? "critical" : "warning",
        message: `Slow database response: ${metrics.database}ms`
      });
      if (metrics.database > 5000) criticalCount++;
      else warningCount++;
    }

    let status = "healthy";
    if (criticalCount > 0) {
      status = "critical";
    } else if (warningCount > 0) {
      status = "warning";
    }

    return {
      status,
      alerts,
      summary: {
        critical: criticalCount,
        warning: warningCount,
        healthy: 4 - criticalCount - warningCount
      }
    };
  }

  // Get database connection status
  getConnectionStatus(state) {
    const states = {
      0: { status: "Disconnected", color: "red" },
      1: { status: "Connected", color: "green" },
      2: { status: "Connecting", color: "yellow" },
      3: { status: "Disconnecting", color: "orange" }
    };
    return states[state] || { status: "Unknown", color: "gray" };
  }

  // Monitor system health continuously
  startMonitoring(interval = 30000) {
    console.log(`Starting system health monitoring (interval: ${interval}ms)`);
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        
        // Store metrics history (keep last 100 entries)
        this.addMetricToHistory("cpu", health.metrics.cpu);
        this.addMetricToHistory("memory", health.metrics.memory);
        this.addMetricToHistory("disk", health.metrics.disk);
        this.addMetricToHistory("database", health.metrics.database);

        // Check for critical alerts
        if (health.status === "critical") {
          console.warn("CRITICAL SYSTEM ALERT:", health.alerts);
          // Here you could send notifications, emails, etc.
        }
      } catch (error) {
        console.error("Error in system monitoring:", error);
      }
    }, interval);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      console.log("System health monitoring stopped");
    }
  }

  // Add metric to history
  addMetricToHistory(type, metric) {
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }
    
    this.metrics[type].push({
      timestamp: new Date(),
      ...metric
    });

    // Keep only last 100 entries
    if (this.metrics[type].length > 100) {
      this.metrics[type] = this.metrics[type].slice(-100);
    }
  }

  // Get metrics history
  getMetricsHistory(type, limit = 50) {
    if (!this.metrics[type]) {
      return [];
    }
    return this.metrics[type].slice(-limit);
  }

  // Get performance metrics for charts
  getPerformanceMetrics(hours = 1) {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const allMetrics = [];
    const types = ["cpu", "memory", "database"];
    
    types.forEach(type => {
      const history = this.getMetricsHistory(type, 100);
      history.forEach(metric => {
        if (new Date(metric.timestamp) >= startTime) {
          allMetrics.push({
            timestamp: metric.timestamp,
            type: type,
            value: type === "database" ? metric.responseTime : metric.usage
          });
        }
      });
    });

    // Group by timestamp and create chart data
    const groupedData = {};
    allMetrics.forEach(metric => {
      const timeKey = new Date(metric.timestamp).toISOString();
      if (!groupedData[timeKey]) {
        groupedData[timeKey] = { timestamp: timeKey };
      }
      groupedData[timeKey][metric.type === "database" ? "responseTime" : `${metric.type}Usage`] = metric.value;
    });

    return Object.values(groupedData).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
}

// Create singleton instance
const systemHealthService = new SystemHealthService();

module.exports = systemHealthService;