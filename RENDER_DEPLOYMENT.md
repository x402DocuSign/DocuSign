# Render.com Deployment Guide

## Prerequisites
- Render account (free tier available at https://render.com)
- GitHub repository pushed (already done ✓)
- PostgreSQL database URL (will be auto-generated)

## Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Click "Sign up" → "Continue with GitHub"
3. Authorize Render to access your GitHub repositories

## Step 2: Connect GitHub Repository
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub account if not already connected
4. Select repository: `Pixeeee/DocuSign`
5. Authorize Render to access the repository

## Step 3: Configure Web Service
**Basic Settings:**
- **Name**: `esign-platform` (or your choice)
- **Environment**: `Node`
- **Region**: `Oregon` (US) or closest to you
- **Branch**: `main`
- **Build Command**: 
  ```
  pnpm install --frozen-lockfile && pnpm turbo build
  ```
- **Start Command**: 
  ```
  pnpm run start
  ```
- **Plan**: `Free` (or paid for production)

## Step 4: Add Environment Variables
In the "Environment" section, add:

```
NODE_ENV              production
NODE_VERSION          22.22.2
DATABASE_URL          (will add in step 6)
JWT_PRIVATE_KEY       (your JWT private key)
JWT_PUBLIC_KEY        (your JWT public key)
NEXTAUTH_SECRET       (generate: openssl rand -base64 32)
NEXTAUTH_URL          (will auto-populate from Render URL)
API_URL               (will auto-populate from Render URL)
```

## Step 5: Create PostgreSQL Database
1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: `esign-postgres` (or your choice)
   - **Database**: `esign_db`
   - **User**: `esign_user`
   - **Plan**: `Free` (spinning down after 15 days of inactivity)
   - **Region**: Same as web service

4. Copy the generated `Internal Database URL`
5. Go back to web service settings
6. Add environment variable: `DATABASE_URL` = `[Internal Database URL]`

## Step 6: Deploy
1. Click "Create Web Service"
2. Render will start building from GitHub
3. Watch build logs in real-time
4. Service will be live at: `https://esign-platform.onrender.com`

**Build will:**
- ✅ Detect pnpm from package.json
- ✅ Install dependencies
- ✅ Build with turbo
- ✅ Start Next.js + API

## Step 7: Run Database Migrations
Once deployed:

1. Option A - Using Render Shell:
   - Click service name in dashboard
   - Go to "Shell"
   - Run:
     ```bash
     pnpm --filter @esign/db migrate deploy
     ```

2. Option B - SSH into container:
   ```bash
   render ssh -e production
   cd /app
   pnpm --filter @esign/db migrate deploy
   exit
   ```

## Step 8: Access Your App
- **Frontend**: `https://esign-platform.onrender.com`
- **Backend API**: `https://esign-platform.onrender.com/api/*`
- **Health Check**: `https://esign-platform.onrender.com/api/health`

## Important Notes ⚠️

### Free Tier Limitations
- **Web Service**: 
  - Spinning down after 15 minutes of inactivity
  - Wakes up on first request (30-second delay)
  - Limited to shared CPU
  
- **PostgreSQL**: 
  - 1 database (others cost money)
  - Spins down after 90 days of inactivity
  - Limited to 1GB storage

### For Production
Upgrade to:
- **Paid Web Service**: $7/month (always running)
- **Paid PostgreSQL**: $15/month (production-grade)

## Common Commands

```bash
# Redeploy from GitHub
# Go to dashboard → Settings → Manual Deploy

# View logs
# Dashboard → Logs tab

# SSH into service
render ssh -e production

# Update environment variables
# Dashboard → Environment tab

# Scale services
# Dashboard → Settings → Plan (requires paid tier)

# View database
# Database dashboard → Connect tab
```

## Troubleshooting

**Build failing?**
```
1. Check logs in Render dashboard
2. Common issues:
   - NODE_VERSION mismatch (set to 22.22.2)
   - Missing environment variables
   - pnpm lockfile mismatch
```

**Database not connecting?**
```bash
# Test connection
psql $DATABASE_URL
```

**App waking up slowly?**
- This is normal on free tier (30-second cold start)
- Upgrade to paid plan for instant response

**Environment variables not updating?**
- Update in Render dashboard
- Manually redeploy from GitHub

## GitHub Integration

Render auto-deploys when you push to `main`:
```bash
git push origin main
# → Render automatically detects changes
# → Builds and deploys within 2-3 minutes
```

Disable auto-deploy:
- Dashboard → Settings → Auto-Deploy: OFF

## Monitoring

**Health Check Endpoint:**
Render periodically checks `https://esign-platform.onrender.com/api/health`

**View Status:**
- Dashboard home page shows service status
- Green = running, Red = down

## Upgrading from Free Tier

When ready for production:

1. **Web Service** → Settings → Upgrade Plan ($7+/month)
   - Always-on service
   - Dedicated resources
   - Better performance

2. **PostgreSQL** → Settings → Upgrade Plan ($15+/month)
   - Production-grade database
   - Automatic backups
   - Higher storage limits

## Support & Docs

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- GitHub Issues: [DocuSign Repo](https://github.com/Pixeeee/DocuSign/issues)

---

**Your app is ready to deploy to Render!** 🚀

Once deployed, share your app URL and invite collaborators to test the complete eSign platform.
