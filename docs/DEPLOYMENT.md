# ParkSathi Deployment Guide
**Conceptualized & Developed by Shreeraj Tuladhar - 1Ox4Fox LLC**

## 🚀 Production Deployment

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MongoDB Atlas account (recommended)
- Redis instance
- SSL certificates (for production)

### Quick Start

1. **Clone & Setup**
```bash
git clone <repository-url>
cd PMS_webapp
cp .env.example .env
```

2. **Configure Environment**
```bash
# Edit .env file with your production values
MONGODB_URI=mongodb://your-mongodb-connection
REDIS_URL=redis://your-redis-connection
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-domain.com
```

3. **Deploy with Docker**
```bash
# Production deployment
docker-compose up -d

# Development environment
docker-compose --profile development up -d

# With monitoring
docker-compose --profile monitoring up -d
```

### 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│              Nginx (Port 80/443)        │
│          Reverse Proxy & SSL            │
└─────────────┬───────────────────────────┘
              │
┌─────────────┴───────────────────────────┐
│         ParkSathi App (Port 3000)       │
│    React Frontend + Node.js Backend     │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───┴────┐         ┌────┴────┐
│MongoDB │         │  Redis  │
│(27017) │         │ (6379)  │
└────────┘         └─────────┘
```

### 🔧 Configuration

#### Environment Variables
```bash
# Core Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
MONGODB_URI=mongodb://localhost:27017/parksathi
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# External Services
FRONTEND_URL=https://your-domain.com
```

#### Docker Compose Profiles

**Production (Default)**
```bash
docker-compose up -d
```
Includes: App, MongoDB, Redis, Nginx

**Development**
```bash
docker-compose --profile development up -d
```
Includes: All production services + hot-reload development servers

**Monitoring**
```bash
docker-compose --profile monitoring up -d
```
Includes: All services + Prometheus + Grafana

### 🛠️ Advanced Configuration

#### SSL Setup (Production)
1. Place SSL certificates in `ssl-certs/` volume
2. Update nginx configuration
3. Enable HTTPS server block in nginx-default.conf

#### Custom Nginx Configuration
```bash
# Edit configuration
vim config/nginx-default.conf

# Restart nginx
docker-compose restart parksathi-nginx
```

#### MongoDB Replica Set (High Availability)
```yaml
# Add to docker-compose.yml
parksathi-mongo-replica:
  image: mongo:7.0
  command: mongod --replSet rs0
  # ... additional configuration
```

### 📊 Monitoring & Logging

#### Application Logs
```bash
# View application logs
docker logs parksathi-app -f

# View nginx logs
docker logs parksathi-nginx -f

# View all logs
docker-compose logs -f
```

#### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Nginx health
curl http://localhost/health

# Database health
docker exec parksathi-mongo mongosh --eval "db.adminCommand('ping')"
```

#### Monitoring Dashboard
- **Grafana:** http://localhost:3001 (admin/admin123)
- **Prometheus:** http://localhost:9090

### 🔒 Security Considerations

#### SSL/HTTPS
- Use Let's Encrypt for free SSL certificates
- Configure HSTS headers
- Implement proper CORS policies

#### Database Security
- Use MongoDB authentication
- Configure Redis with password
- Regular security updates

#### Application Security
- JWT token rotation
- Rate limiting configured
- Input validation and sanitization

### 📈 Performance Optimization

#### Frontend Optimization
- Code splitting implemented
- PWA with service worker caching
- Gzip compression enabled
- CDN ready for static assets

#### Backend Optimization
- Redis caching layer
- Database indexing
- Connection pooling
- PM2 cluster mode

#### Nginx Optimization
- Gzip compression
- Static file caching
- Connection keep-alive
- Rate limiting

### 🚀 Scaling Strategy

#### Horizontal Scaling
```yaml
# Scale application containers
docker-compose up -d --scale parksathi-app=3

# Load balancer configuration
# Update nginx upstream configuration
```

#### Database Scaling
- MongoDB sharding for large datasets
- Read replicas for read-heavy workloads
- Redis cluster for high availability

#### CDN Integration
- Configure CloudFront/CloudFlare
- Optimize asset delivery
- Global content distribution

### 🔄 CI/CD Pipeline

#### GitHub Actions (Recommended)
```yaml
name: Deploy ParkSathi
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: ./scripts/deploy.sh
```

#### Deployment Script
```bash
#!/bin/bash
# Automated deployment script
docker-compose pull
docker-compose up -d --remove-orphans
docker system prune -f
```

### 📱 Mobile Deployment (PWA)

#### App Store Deployment
- Use PWABuilder for app store packages
- Configure app store metadata
- Submit to Google Play Store / Apple App Store

#### Mobile Optimization
- Touch-friendly interface
- Offline functionality
- Push notifications configured

### 🧪 Testing

#### Run All Tests
```bash
./scripts/run-tests.sh
```

#### Specific Test Suites
```bash
./scripts/run-tests.sh backend
./scripts/run-tests.sh frontend
./scripts/run-tests.sh docker
./scripts/run-tests.sh security
```

### 🆘 Troubleshooting

#### Common Issues

**Container Won't Start**
```bash
# Check logs
docker-compose logs parksathi-app

# Check resource usage
docker stats
```

**Database Connection Issues**
```bash
# Test MongoDB connection
docker exec parksathi-mongo mongosh --eval "db.stats()"

# Test Redis connection
docker exec parksathi-redis redis-cli ping
```

**Performance Issues**
```bash
# Monitor resource usage
docker stats

# Check application metrics
curl http://localhost:3000/api/metrics
```

### 📞 Support

For deployment issues or questions:
- **Developer:** Shreeraj Tuladhar
- **Company:** 1Ox4Fox LLC
- **Email:** support@1ox4fox.com

### 📄 License

© 2025 1Ox4Fox LLC - All Rights Reserved
Intellectual Property Protected

---

**🎉 Congratulations! Your ParkSathi application is now production-ready!**