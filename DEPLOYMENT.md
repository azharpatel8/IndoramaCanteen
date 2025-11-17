# Deployment Guide - Indorama Canteen Web App

## Pre-Deployment Checklist

### Application
- [ ] All modules tested (menu, orders, billing, feedback)
- [ ] Error handling validated
- [ ] Environment variables configured
- [ ] JWT secret changed from default
- [ ] API endpoints documented
- [ ] Frontend build successful (`npm run build`)
- [ ] No console errors in browser
- [ ] No console errors in server

### Database
- [ ] Oracle database running and accessible
- [ ] Schema created and all tables verified
- [ ] Sequences created
- [ ] Indexes created
- [ ] Sample data loaded
- [ ] Database backups configured
- [ ] Connection string verified

### Security
- [ ] Strong JWT_SECRET configured
- [ ] Strong Oracle passwords set
- [ ] CORS properly configured
- [ ] Authentication middleware enabled
- [ ] Input validation active
- [ ] SQL injection prevention verified
- [ ] No sensitive data in code
- [ ] SSL/TLS configured for production

## Production Deployment Steps

### 1. Environment Setup

#### Create production .env file
```env
VITE_API_URL=https://api.example.com/api

PORT=3001
NODE_ENV=production

ORACLE_USER=canteen_prod_user
ORACLE_PASSWORD=StrongPassword123!@#
ORACLE_CONNECT_STRING=oracle.production.com:1521/PROD

ORACLE_POOL_MIN=5
ORACLE_POOL_MAX=20

JWT_SECRET=GenerateWithCrypto.randomBytes(32).toString('hex')
```

#### Generate strong JWT secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Server Setup

#### Linux Server
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create application directory
sudo mkdir -p /var/www/canteen-app
sudo chown -R ubuntu:ubuntu /var/www/canteen-app
cd /var/www/canteen-app

# Clone or copy project
# git clone <repo-url> .
# Or copy via SCP

# Install dependencies
npm install --production=false

# Build frontend
npm run build
```

#### Install PM2 for Process Management
```bash
sudo npm install -g pm2

# Create PM2 ecosystem file
pm2 init simple
```

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'canteen-api',
      script: './server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
```

#### Start Application with PM2
```bash
# Start application
pm2 start ecosystem.config.js

# Monitor application
pm2 monit

# View logs
pm2 logs canteen-api

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

### 3. Reverse Proxy Setup (Nginx)

#### Install Nginx
```bash
sudo apt-get install -y nginx
```

#### Configure Nginx
Create `/etc/nginx/sites-available/canteen`:
```nginx
server {
    listen 80;
    server_name api.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/canteen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Certificate Setup

#### Using Let's Encrypt
```bash
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d api.example.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 5. Database Backup Strategy

#### Automated Daily Backups
```bash
# Create backup script: /home/ubuntu/backup-db.sh
#!/bin/bash
BACKUP_DIR="/backups/canteen"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
expdp canteen_user/password@PROD DIRECTORY=DATA_PUMP_DIR \
  DUMPFILE=canteen_$DATE.dmp LOGFILE=canteen_$DATE.log

# Compress backup
gzip $BACKUP_DIR/canteen_$DATE.dmp

# Keep only last 7 days
find $BACKUP_DIR -name "canteen_*.dmp.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/canteen_$DATE.dmp.gz"
```

#### Cron Job for Daily Backups
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/ubuntu/backup-db.sh >> /var/log/canteen-backup.log 2>&1

# Weekly backup to S3
0 3 * * 0 aws s3 cp /backups/canteen/ s3://my-backups/canteen/ --recursive
```

### 6. Monitoring and Logging

#### Application Logs
```bash
# View logs
pm2 logs canteen-api

# Persistent logs
sudo mkdir -p /var/log/canteen
sudo chown ubuntu:ubuntu /var/log/canteen
```

#### Monitor System Resources
```bash
# Install monitoring tools
sudo apt-get install -y htop iotop nethogs

# Monitor continuously
htop
```

#### Setup Log Rotation
Create `/etc/logrotate.d/canteen`:
```
/var/log/canteen/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
}
```

### 7. Performance Optimization

#### Database Connection Pool
```env
ORACLE_POOL_MIN=5
ORACLE_POOL_MAX=20
```

#### Nginx Caching
```nginx
# Cache static assets for 1 month
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1M;
    add_header Cache-Control "public, immutable";
}
```

#### Database Indexes
Already created in schema.sql:
- idx_orders_user_id
- idx_orders_status
- idx_order_items_order_id
- idx_billing_order_id
- idx_billing_user_id
- idx_feedback_user_id
- idx_menu_items_category

### 8. Disaster Recovery

#### Database Recovery
```bash
# Restore from backup
impdp canteen_user/password@PROD DIRECTORY=DATA_PUMP_DIR \
  DUMPFILE=canteen_20240101_120000.dmp LOGFILE=recover.log
```

#### Application Recovery
```bash
# Restore from git
git clone <repo-url> /var/www/canteen-app-restore
npm install --production=false
npm run build
pm2 restart canteen-api
```

### 9. Monitoring Checklist

Daily:
- [ ] Application running (`pm2 list`)
- [ ] No errors in logs
- [ ] Database responsive
- [ ] API responding to requests
- [ ] Backup completed successfully

Weekly:
- [ ] SSL certificate valid
- [ ] Disk space available
- [ ] Memory usage normal
- [ ] Database performance acceptable
- [ ] Backup integrity tested

Monthly:
- [ ] Security updates applied
- [ ] Performance analysis
- [ ] Disaster recovery drill
- [ ] User feedback review

### 10. Rollback Plan

If deployment fails:
```bash
# Revert to previous build
cd /var/www/canteen-app
git revert HEAD --no-edit
npm install
npm run build
pm2 restart canteen-api

# Or use PM2 restart
pm2 restart canteen-api --force

# Check logs for errors
pm2 logs canteen-api
```

## Health Check Endpoints

### Test Application Health
```bash
curl -X GET http://localhost:3001/api/menu

# Should return 200 with menu items
```

### Test Database Connection
```sql
sqlplus canteen_user/password@PROD
SQL> SELECT COUNT(*) FROM MENU_ITEMS;
```

## Performance Benchmarks

Expected metrics:
- API Response Time: < 200ms
- Database Query Time: < 100ms
- Page Load Time: < 2s
- Concurrent Users: 100+

## Support Contact

For production issues:
1. Check PM2 logs: `pm2 logs canteen-api`
2. Check Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Check Oracle: `sqlplus sys/password as sysdba` and check alert log
4. Contact: support@indorama.com

## Maintenance Windows

- Database backups: 2-3 AM IST
- Security updates: 3-4 AM IST (Monthly)
- System maintenance: Sunday 4-5 AM IST
- No planned downtime: Weekdays 9 AM - 6 PM IST

---

Deployment completed! The application is now running in production.
