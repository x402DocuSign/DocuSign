# Vercel Deployment Guide

This document provides instructions for deploying the eSign Platform to Vercel.

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed or Vercel account on vercel.com
- All environment variables configured
- Database (PostgreSQL) accessible from Vercel
- Redis instance configured for production

## Deployment Steps

### 1. Prepare Environment Variables

Create a Vercel project and configure the following environment variables in **Settings → Environment Variables**:

#### Database & Services
```
DATABASE_URL=postgresql://user:password@host:5432/esign_db
REDIS_URL=redis://user:password@host:6379
```

#### Authentication (JWT)
```
JWT_SECRET=your-secret-key-min-64-characters
JWT_PRIVATE_KEY_PATH=./keys/jwt_private.pem
JWT_PUBLIC_KEY_PATH=./keys/jwt_public.pem
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
```

#### X402 Payment Configuration
```
X402_NETWORK=base-sepolia
X402_FACILITATOR_URL=https://facilitator.example.com
X402_WALLET_ADDRESS=0xa2B39121fb512817d0556Fe795574D314C355f17
X402_CHAIN_ID=84532
X402_PRICE_PER_SIGN=0.0001
```

#### AWS S3 (or local storage in development)
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_KMS_KEY_ID=your-kms-key-id
```

#### Email Configuration
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

#### Other Configuration
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
TOTP_APP_NAME=eSign
TOTP_ISSUER=eSign
```

### 2. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel --prod
```

### 3. Deploy via GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure project settings:
   - Root Directory: (leave blank for monorepo)
   - Build command: `pnpm turbo build`
   - Output directory: (auto-detected)
5. Add all environment variables in "Environment Variables" section
6. Click "Deploy"

## Important Notes

### Monorepo Structure
This project uses a monorepo with:
- `apps/web` - Next.js web application (main frontend)
- `apps/api` - Express.js API server
- `apps/docs` - Next.js documentation

The `vercel.json` configuration handles the monorepo setup automatically.

### Database Migrations
Run database migrations before deploying:

```bash
# Generate and apply migrations
pnpm turbo run db:migrate
```

Ensure your PostgreSQL database is accessible from Vercel's network.

### File Uploads
- **Development**: Files are stored in `.storage/uploads/`
- **Production**: Configure AWS S3 with proper IAM credentials
- **Limitation**: Vercel's serverless functions don't support persistent file storage

### API Deployment
The API runs as a separate serverless function. Make sure to:
- Set `API_URL` environment variable to the API's public URL
- Configure CORS for your domain
- Test API endpoints after deployment

### Performance Optimization
- Enable "Incremental Static Regeneration" for Next.js apps
- Use HTTP caching headers appropriately
- Monitor Vercel Analytics for performance issues

## Troubleshooting

### Build Failures
Check the build logs in Vercel dashboard:
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation
- Check for missing environment variables

### Database Connection Issues
- Ensure PostgreSQL is accessible from Vercel's IPs
- Check connection string format
- Verify firewall/security group settings

### Environment Variables Not Loading
- Redeploy after adding/changing environment variables
- Verify variable names match exactly (case-sensitive)
- Check ".env" files are NOT committed to git

## Rollback

To rollback to a previous deployment:
1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments"
4. Click "Redeploy" on a previous successful deployment

## Production Checklist

- [ ] Database backups configured
- [ ] All environment variables set
- [ ] DNS configured correctly
- [ ] SSL certificate valid
- [ ] Email service configured
- [ ] AWS S3 credentials set
- [ ] X402 payment configured with correct network
- [ ] Redis instance running
- [ ] JWT keys generated and stored securely
- [ ] CORS origins configured
- [ ] Rate limiting configured
- [ ] Monitoring/logging set up
- [ ] Error tracking configured (Sentry/similar)

## Support

For issues with Vercel deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Project Issues on GitHub
