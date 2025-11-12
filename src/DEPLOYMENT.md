# Vercel Deployment Guide

## Prerequisites
- GitHub repository with your code pushed to the `main` branch
- Vercel account (sign up at https://vercel.com)
- Neon PostgreSQL database (already configured)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is committed and pushed to the `main` branch:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git checkout main
git merge dev
git push origin main
```

### 2. Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository: `Ianlaur/BDD1`
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `src` (IMPORTANT!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3. Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Variables:

```env
DATABASE_URL
postgresql://neondb_owner:npg_IE4b0PSHBwmz@ep-old-darkness-ag5157bg.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_SECRET
L+SUIpEcfs34XaDx8wsUi25QjlF/ZBJt/Viz6N8izWI=

NEXTAUTH_URL
https://your-project-name.vercel.app
(Update after deployment with your actual Vercel URL)

NODE_ENV
production
```

#### Optional (for Google OAuth):
```env
GOOGLE_CLIENT_ID
(your Google client ID)

GOOGLE_CLIENT_SECRET
(your Google client secret)
```

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://your-project-name.vercel.app`

### 5. Update NEXTAUTH_URL

1. Copy your Vercel deployment URL
2. Go to Vercel Project Settings > Environment Variables
3. Update `NEXTAUTH_URL` with your actual URL
4. Redeploy the project

### 6. Setup Production Database

Your Neon database is already configured. If you need to seed it:

```bash
# Connect to production database temporarily
DATABASE_URL="postgresql://neondb_owner:npg_IE4b0PSHBwmz@ep-old-darkness-ag5157bg.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require" npm run db:seed
```

Or run migrations:
```bash
DATABASE_URL="your_production_url" npx prisma db push
```

## Git Branch Configuration

The `vercel.json` file is configured to:
- ✅ Deploy ONLY from the `main` branch
- ❌ Ignore deployments from `dev` and other branches

## Post-Deployment Checklist

- [ ] Verify the application loads at your Vercel URL
- [ ] Test authentication (sign in/sign up)
- [ ] Check database connectivity
- [ ] Test association browsing
- [ ] Verify admin dashboard access
- [ ] Update any hardcoded URLs in your code
- [ ] Configure custom domain (optional)

## Branch Strategy

- **main**: Production branch (auto-deploys to Vercel)
- **dev**: Development branch (local testing only)

Always merge `dev` → `main` when ready to deploy:

```bash
git checkout dev
git pull origin dev
# ... make changes ...
git add .
git commit -m "Feature: description"
git push origin dev

# When ready to deploy
git checkout main
git merge dev
git push origin main
# Vercel will auto-deploy
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `src` is set as root directory

### Database Connection Issues
- Verify DATABASE_URL includes `?sslmode=require`
- Check Neon database is active
- Ensure IP whitelist allows Vercel (Neon allows all by default)

### Authentication Issues
- Verify NEXTAUTH_URL matches your Vercel URL (no trailing slash)
- Check NEXTAUTH_SECRET is set
- Ensure Google OAuth credentials are configured if using Google login

## Useful Commands

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from CLI
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Check environment variables
vercel env ls
```

## Domain Configuration (Optional)

1. Go to Vercel Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update NEXTAUTH_URL to use custom domain

## Monitoring

- **Dashboard**: https://vercel.com/dashboard
- **Analytics**: Built-in Vercel Analytics
- **Logs**: Real-time function logs in Vercel dashboard

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Neon Docs: https://neon.tech/docs
