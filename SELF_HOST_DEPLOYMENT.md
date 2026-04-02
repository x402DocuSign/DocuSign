# Manual Self-Hosting Deployment Guide

Complete step-by-step guide to deploy eSign platform on your own server.

## Prerequisites

- **Server**: Linux server (Ubuntu 22.04 LTS recommended) with SSH access
- **Domain**: Custom domain or server IP address
- **Disk Space**: At least 5GB free space
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Port Access**: Access to ports 80, 443, and 3000
- **GitHub Access**: Your repository (Pixeeee/DocuSign)

---

## PART 1: Server Setup (Initial - Run Once)

### Step 1.1: SSH into Your Server

```bash
ssh username@your-server-ip
# or
ssh username@your-domain.com
```

### Step 1.2: Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 1.3: Install Required Dependencies

```bash
# Install build tools and utilities
sudo apt install -y curl wget git build-essential python3

# Install Node.js 22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v22.x.x
npm --version   # Should be 10.x.x
```

### Step 1.4: Install pnpm (Package Manager)

```bash
npm install -g pnpm@9

# Verify
pnpm --version  # Should be 9.x.x
```

### Step 1.5: Install PM2 (Process Manager)

```bash
npm install -g pm2

# Verify
pm2 --version
```

### Step 1.6: Install PostgreSQL Database

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
sudo systemctl status postgresql
```

### Step 1.7: Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In the PostgreSQL prompt, run:
CREATE DATABASE esign_db;
CREATE USER esign_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE esign_db TO esign_user;
\q

# Verify connection
psql -h localhost -U esign_user -d esign_db
# When prompted for password, enter the password you created
# Type: \q to exit
```

**Note:** Replace `your_secure_password_here` with a strong password. Save it for later.

### Step 1.8: Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### Step 1.9: Install Certbot (SSL Certificates)

```bash
sudo apt install -y certbot python3-certbot-nginx

# This will be used to set up HTTPS later
```

### Step 1.10: Create Application Directory

```bash
cd ~
mkdir -p esign-platform
cd esign-platform

# Verify you're in the right directory
pwd  # Should show: /home/username/esign-platform
```

---

## PART 2: Application Setup

### Step 2.1: Clone Your GitHub Repository

```bash
cd ~/esign-platform

git clone https://github.com/Pixeeee/DocuSign.git .

# Verify
ls -la  # Should show: package.json, pnpm-workspace.yaml, apps/, packages/ etc.
```

### Step 2.2: Create Environment Variables File

```bash
# Create .env file
nano ~/esign-platform/.env
```

**Paste the following (replace bracketed values):**

```bash
# Node Environment
NODE_ENV=production
NODE_VERSION=22.22.2

# Database Connection
DATABASE_URL=postgresql://esign_user:your_secure_password_here@localhost:5432/esign_db

# JWT Authentication (copy from your local .env.local)
JWT_PRIVATE_KEY=[COPY_FROM_LOCAL_.env.local]
JWT_PUBLIC_KEY=[COPY_FROM_LOCAL_.env.local]

# NextAuth Configuration
NEXTAUTH_SECRET=[GENERATE_NEW: openssl rand -base64 32]
NEXTAUTH_URL=https://your-domain.com
API_URL=https://your-domain.com

# Optional: S3 Storage (for production file uploads)
# AWS_S3_BUCKET=your-bucket-name
# AWS_S3_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
```

**How to get values:**

1. **JWT_PRIVATE_KEY and JWT_PUBLIC_KEY**:
   ```bash
   # On your local machine, run:
   cat .env.local | grep JWT_PRIVATE_KEY
   cat .env.local | grep JWT_PUBLIC_KEY
   # Copy the values (everything after the = sign)
   ```

2. **NEXTAUTH_SECRET** (generate new):
   ```bash
   openssl rand -base64 32
   ```

3. **Replace**:
   - `your_secure_password_here` → Password you created in Step 1.7
   - `your-domain.com` → Your actual domain or server IP
   - `[COPY_FROM_LOCAL_.env.local]` → Actual values from your keys

**Save file:** `Ctrl+X` → `Y` → `Enter`

### Step 2.3: Install Dependencies

```bash
cd ~/esign-platform

pnpm install --frozen-lockfile

# This may take 2-5 minutes
```

### Step 2.4: Build the Application

```bash
pnpm turbo build

# Building... (takes 20-60 seconds)
# You should see: "✓ Packages in scope: 11"
# Message at end: "Successfully built packages"
```

### Step 2.5: Run Database Migrations

```bash
pnpm --filter @esign/db migrate deploy

# You should see: "Migrations have been applied"
```

### Step 2.6: Start Application with PM2

```bash
# Start the app
pm2 start "pnpm run start" --name "esign-platform"

# Check it's running
pm2 status

# View real-time logs
pm2 logs esign-platform
```

**Expected output in logs:**
```
> esign-platform@0.1.0 start
> turbo run start --parallel

API listening on port 3001
Next.js server listening on port 3000
```

Press `Ctrl+C` to exit logs.

### Step 2.7: Configure PM2 Startup

```bash
# Make PM2 start on system boot
pm2 startup

# Save PM2 process list
pm2 save

# Verify
sudo systemctl status pm2-root
```

---

## PART 3: Nginx Configuration

### Step 3.1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/esign-platform
```

**Paste:**

```nginx
# Nginx configuration for eSign Platform
# This acts as reverse proxy to Node.js app running on localhost:3000

upstream esign_app {
    server 127.0.0.1:3000;
}

upstream esign_api {
    server 127.0.0.1:3001;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration (HTTP/2)
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Certificates (will be set by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logging
    access_log /var/log/nginx/esign-platform-access.log;
    error_log /var/log/nginx/esign-platform-error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;

    # Proxy settings
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Root location (frontend)
    location / {
        proxy_pass http://esign_app;
        proxy_buffering off;
    }

    # API routes
    location /api/ {
        proxy_pass http://esign_api;
        proxy_buffering off;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://esign_api;
        access_log off;
    }
}
```

**Replace `your-domain.com` with your actual domain.**

Save: `Ctrl+X` → `Y` → `Enter`

### Step 3.2: Enable Nginx Configuration

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/esign-platform /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 3.3: Test Nginx

```bash
# Reload Nginx
sudo systemctl reload nginx

# Verify status
sudo systemctl status nginx
```

---

## PART 4: SSL Certificate (HTTPS)

### Step 4.1: Request SSL Certificate with Certbot

```bash
sudo certbot certonly --nginx -d your-domain.com

# Follow the prompts:
# 1. Enter your email
# 2. Accept terms
# 3. Choose "Agree"

# Certbot will automatically update Nginx config
```

### Step 4.2: Verify Certificate

```bash
# Check certificate details
sudo certbot certificates

# You should see your domain listed with an expiry date
```

### Step 4.3: Test HTTPS

```bash
# Reload Nginx to apply changes
sudo systemctl reload nginx

# Test connection
curl -I https://your-domain.com

# Should see: HTTP/2 200 OK
```

### Step 4.4: Auto-Renewal

```bash
# Enable auto-renewal for certificates
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify timer is running
sudo systemctl status certbot.timer
```

---

## PART 5: Firewall Configuration

### Step 5.1: Enable Firewall

```bash
# Enable UFW (Uncomplicated Firewall)
sudo ufw enable

# Allow SSH (critical - don't lose access!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Deny all other incoming traffic
sudo ufw default deny incoming

# Verify rules
sudo ufw status

# Expected output:
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

---

## PART 6: Verification & Testing

### Step 6.1: Verify Application is Running

```bash
# Check PM2 status
pm2 status

# Should show: esign-platform | online

# Check logs for errors
pm2 logs esign-platform --lines 50
```

### Step 6.2: Test Frontend

Open browser and go to:
```
https://your-domain.com
```

You should see the eSign login page.

### Step 6.3: Test API

```bash
# Test health endpoint
curl https://your-domain.com/api/health

# Expected response:
# {"status":"ok"}
```

### Step 6.4: Test Complete Flow

1. **Go to**: `https://your-domain.com`
2. **Register**: Create test account
3. **Login**: Use test credentials
4. **Upload Document**: Try uploading a PDF
5. **Sign Document**: Test signature functionality
6. **Download**: Verify downloaded file
7. **Payment**: Test X402 payment with MetaMask on Base Sepolia

---

## PART 7: Maintenance

### Viewing Logs

```bash
# Real-time logs
pm2 logs esign-platform

# Last 100 lines
pm2 logs esign-platform --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/esign-platform-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/esign-platform-error.log
```

### Restarting Application

```bash
# Restart app (without downtime)
pm2 restart esign-platform

# Or reload (graceful restart)
pm2 reload esign-platform
```

### Updating Application

When you push changes to GitHub, manually pull and rebuild:

```bash
cd ~/esign-platform

# Pull latest code
git pull origin main

# Reinstall dependencies (if package.json changed)
pnpm install --frozen-lockfile

# Rebuild
pnpm turbo build

# Run migrations (if database changed)
pnpm --filter @esign/db migrate deploy

# Restart application
pm2 restart esign-platform
```

### Checking System Resources

```bash
# CPU and Memory usage
pm2 monit

# Disk space
df -h

# Memory usage
free -h

# Active processes
ps aux | grep node
```

### Database Backup

```bash
# Create backup
sudo -u postgres pg_dump esign_db > ~/esign-backup-$(date +%Y%m%d).sql

# List backups
ls -lh ~/*.sql

# Restore from backup (if needed)
sudo -u postgres psql esign_db < ~/esign-backup-20260403.sql
```

---

## PART 8: Troubleshooting

### Application Not Starting

**Error**: `pm2 status` shows `errored`

```bash
# Check logs
pm2 logs esign-platform

# Look for error messages, common issues:
# 1. Database connection failed
#    → Check DATABASE_URL in .env
#    → Verify PostgreSQL is running: sudo systemctl status postgresql
#    
# 2. Port already in use
#    → Check what's using port 3000: sudo lsof -i :3000
#    → Kill process: sudo kill -9 <PID>
#
# 3. Out of memory
#    → Check available RAM: free -h
#    → Upgrade server or optimize app

# Restart after fix
pm2 restart esign-platform
```

### Database Connection Failed

```bash
# Test database connection
psql -h localhost -U esign_user -d esign_db

# If connection fails, check:
# 1. PostgreSQL is running
sudo systemctl status postgresql

# 2. Database exists
sudo -u postgres psql -l | grep esign_db

# 3. User permissions
sudo -u postgres psql -c "SELECT * FROM information_schema.role_table_grants WHERE role_name = 'esign_user';"
```

### Nginx Not Responding

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --dry-run

# Check auto-renewal status
sudo systemctl status certbot.timer
```

### High CPU/Memory Usage

```bash
# Monitor in real-time
pm2 monit

# Kill and restart app
pm2 delete esign-platform
pm2 start "pnpm run start" --name "esign-platform"

# If persistent, check for memory leaks in app logs
pm2 logs esign-platform --lines 200
```

### Firewall Blocking Traffic

```bash
# Check firewall status
sudo ufw status

# If port blocked, allow it:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Reload firewall
sudo ufw reload
```

---

## PART 9: Auto-Deployment from GitHub (GitHub Actions)

If you set up the GitHub Actions workflow (`.github/workflows/deploy.yml`), the server will auto-deploy when you push to `main`.

### Manual Update Without GitHub Actions

```bash
# On your server, create a cron job to pull and redeploy every hour:
crontab -e

# Add this line at the end:
0 * * * * cd ~/esign-platform && git pull origin main && pnpm install --frozen-lockfile && pnpm turbo build && pm2 restart esign-platform

# Save and exit (Ctrl+X → Y → Enter)
```

This will automatically pull the latest code every hour, rebuild, and restart.

---

## PART 10: Performance Optimization

### Enable Caching

Edit `/etc/nginx/sites-available/esign-platform`:

```nginx
# Add inside the https server block:
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### Increase Node.js Memory

```bash
# Edit PM2 configuration
pm2 start "NODE_OPTIONS=--max-old-space-size=2048 pnpm run start" --name "esign-platform"
```

### Monitor Performance

```bash
# Install PM2 monitoring (optional)
npm install -g pm2-monitoring

# View detailed metrics
pm2 web

# Access dashboard at: http://your-server-ip:9615
```

---

## PART 11: Backup & Disaster Recovery

### Automated Database Backups

```bash
# Create backup script
nano ~/backup-database.sh
```

Paste:
```bash
#!/bin/bash
BACKUP_DIR=~/backups
BACKUP_FILE="$BACKUP_DIR/esign-db-$(date +%Y%m%d_%H%M%S).sql"

mkdir -p $BACKUP_DIR

sudo -u postgres pg_dump esign_db > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

Save: `Ctrl+X` → `Y` → `Enter`

Make executable and schedule:
```bash
chmod +x ~/backup-database.sh

# Run daily at 2 AM
crontab -e
# Add line: 0 2 * * * ~/backup-database.sh
```

### Disaster Recovery Plan

**If server fails:**

1. Get new server with same specs
2. Follow PART 1 (Server Setup)
3. Follow PART 2 (Application Setup) 
4. Restore database from backup:
   ```bash
   sudo -u postgres psql esign_db < ~/esign-backup-20260403.sql
   ```
5. Application will be back online

---

## Useful Commands Reference

```bash
# Application Management
pm2 status                              # Check running processes
pm2 logs esign-platform                 # View application logs
pm2 restart esign-platform              # Restart application
pm2 stop esign-platform                 # Stop application
pm2 start "pnpm run start" --name "esign-platform"  # Start application

# Git Operations
git pull origin main                    # Get latest code
git status                              # Check for changes
git log --oneline -5                    # View last 5 commits

# Build & Deploy
pnpm install --frozen-lockfile          # Install dependencies
pnpm turbo build                        # Build application
pnpm --filter @esign/db migrate deploy  # Run database migrations

# Database
psql -h localhost -U esign_user -d esign_db  # Connect to database
sudo -u postgres psql                   # Connect as postgres user
sudo systemctl restart postgresql       # Restart database

# Nginx
sudo systemctl restart nginx            # Restart web server
sudo nginx -t                           # Test configuration
sudo systemctl status nginx             # Check nginx status

# Firewall
sudo ufw status                         # Check firewall rules
sudo ufw allow 80/tcp                   # Allow HTTP
sudo ufw allow 443/tcp                  # Allow HTTPS

# System
df -h                                   # Disk space usage
free -h                                 # Memory usage
top                                     # Real-time system monitor
ps aux | grep node                      # Find Node.js processes
```

---

## Success Checklist

✅ Server setup complete  
✅ Application cloned and running  
✅ Database connected and migrations applied  
✅ Nginx configured as reverse proxy  
✅ SSL/HTTPS certificate installed  
✅ Firewall configured  
✅ PM2 managing application  
✅ Frontend loads at your domain  
✅ API responding to requests  
✅ Full eSign flow tested  
✅ Backups configured  
✅ Auto-renewal for SSL enabled  

---

## Support & Documentation

- **Node.js**: https://nodejs.org/docs
- **pnpm**: https://pnpm.io/
- **PM2**: https://pm2.keymetrics.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **Nginx**: https://nginx.org/en/docs
- **Certbot**: https://certbot.eff.org/docs
- **Project Repo**: https://github.com/Pixeeee/DocuSign

---

**Your eSign platform is now fully self-hosted!** 🚀

For questions, check logs or open an issue on GitHub.
