# Using Neon Branches for Development

## Your Strategy (EXCELLENT IDEA! ✅)

**Main Branch (Production):**
- Real user data
- Used by Vercel production deployment
- URL: `https://your-app.vercel.app`

**Development Branch:**
- Testing and development
- Same schema as production
- Can reset/test without affecting real users
- Used by Vercel preview deployments

## Step-by-Step Setup

### Step 1: Get Your Main Database Working First

1. **Go to Neon Console:** https://console.neon.tech
2. **Find your project** (it should have one of these endpoints):
   - `ep-old-darkness-ag5157bg`
   - `ep-odd-sun-agg6reik`
3. **Check the status** - if it says "Paused" or "Suspended":
   - Click on the project
   - Look for "Resume" or "Activate" button
   - Click it and wait ~10 seconds
4. **Copy the connection string** from the dashboard

### Step 2: Test Main Database Connection

```bash
# Replace with your actual connection string
export PROD_DB='postgresql://neondb_owner:PASSWORD@ep-XXXXX-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'

# Test it
DATABASE_URL="$PROD_DB" npx tsx scripts/test-db-connection.ts
```

If this works, continue. If not, you need to activate the database in Neon console first.

### Step 3: Push Schema to Production Database

```bash
# Push your schema
DATABASE_URL="$PROD_DB" npx prisma db push

# Create your user account
DATABASE_URL="$PROD_DB" npx tsx scripts/ensure-user.ts
```

### Step 4: Create Development Branch

**Option A: Via Neon Console (Recommended)**

1. Go to your Neon project
2. Click on **"Branches"** tab in the left sidebar
3. Click **"Create Branch"**
4. Fill in:
   - **Branch name:** `development` or `testing`
   - **Branch from:** `main` (your production branch)
   - **Type:** Select "Development" or "Preview"
5. Click **"Create Branch"**
6. Copy the connection string for the new branch

**Option B: Via Neon CLI**

```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Create branch
neonctl branches create --project-id YOUR_PROJECT_ID --name development --parent main
```

### Step 5: Set Up Environment Variables

**Create `.env.local` for development:**
```bash
# Development database (Neon branch)
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-XXXXX-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"
```

**Create `.env.production` for reference:**
```bash
# Production database (Neon main branch)
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-XXXXX-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

AUTH_SECRET="your-production-secret"
AUTH_URL="https://your-vercel-url.vercel.app"
```

### Step 6: Configure Vercel for Both Environments

**For Production Deployment:**
1. Go to Vercel → Project Settings → Environment Variables
2. Set these for **Production** only:
   ```
   DATABASE_URL = <production database connection string>
   AUTH_SECRET = <production secret>
   AUTH_URL = https://your-vercel-url.vercel.app
   ```

**For Preview Deployments (optional):**
1. Add these for **Preview** environment:
   ```
   DATABASE_URL = <development branch connection string>
   AUTH_SECRET = <same or different secret>
   AUTH_URL = https://your-preview-url.vercel.app
   ```

### Step 7: Test Locally with Dev Branch

```bash
# Use the development branch
npm run dev

# Sign up and test features
# This uses your development branch database
```

### Step 8: Deploy to Production

```bash
git add .
git commit -m "Configure production and development databases"
git push origin main
```

## How Branches Work

### When You Push to `main`:
- Vercel deploys to production
- Uses **production database** (main Neon branch)
- URL: `https://your-app.vercel.app`

### When You Create a PR:
- Vercel creates preview deployment
- Uses **development database** (dev Neon branch)
- URL: `https://your-app-preview-xyz.vercel.app`

## Benefits of This Setup

✅ **Test safely** - Break things in dev without affecting production
✅ **Same schema** - Both branches have identical structure
✅ **Easy reset** - Delete and recreate dev branch anytime
✅ **Real data** - Can copy production data to dev for testing
✅ **No migration headaches** - Schema changes tested in dev first

## Schema Migration Workflow

1. **Make changes** to `schema.prisma`
2. **Test in dev branch:**
   ```bash
   DATABASE_URL="$DEV_DB" npx prisma db push
   ```
3. **Test locally** with dev database
4. **When ready, push to production:**
   ```bash
   DATABASE_URL="$PROD_DB" npx prisma db push
   ```
5. **Deploy to Vercel**

## Neon Branch Management

**Reset dev branch (start fresh):**
```bash
# Delete and recreate from production
neonctl branches delete development
neonctl branches create --name development --parent main
```

**Copy production data to dev:**
Neon automatically copies data when you create a branch, but you can reset it anytime.

## Cost Consideration

- **Free tier:** 1 main branch + unlimited dev branches
- **Dev branches:** Automatically suspended after inactivity
- **No extra cost** for branches on free tier

## Current Status - What You Need to Do NOW

1. **Go to https://console.neon.tech**
2. **Find your project**
3. **Activate/Resume the main database** if paused
4. **Get the connection string**
5. **Test it works:**
   ```bash
   DATABASE_URL='your-connection-string' npx tsx scripts/test-db-connection.ts
   ```
6. **Once main works, create dev branch** (5 minutes setup)
7. **Update Vercel environment variables**
8. **Deploy** 🚀

The key issue right now is that your main Neon database is not responding. You MUST activate it in the Neon console first before we can create branches.
