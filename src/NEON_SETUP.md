# Quick Guide: Set Up Neon Database for Vercel Deployment

## Problem
Your local PostgreSQL database works fine, but Vercel can't connect to it. You need a cloud database (Neon) that both your local machine and Vercel can access.

## Current Issue
Both Neon connection strings are timing out, which means:
- The databases are **paused** (Neon pauses inactive databases on free tier)
- OR the databases were **deleted**
- OR there's a network/firewall issue

## ✅ Solution: Set Up Fresh Neon Database

### Step 1: Go to Neon Console
1. Visit: https://console.neon.tech
2. Sign in with your account

### Step 2: Check Existing Databases
Look for these databases:
- `ep-old-darkness-ag5157bg` 
- `ep-odd-sun-agg6reik`

**If you see them:**
- Check if they show "Paused" or "Suspended"
- Click on the database
- Look for a "Resume" or "Activate" button
- Click it to wake up the database

**If they're deleted or you can't find them:**
- Continue to Step 3 to create a new one

### Step 3: Create New Neon Database (if needed)

1. Click **"New Project"**
2. Fill in:
   - Project Name: `loft-production`
   - Region: Choose closest to you (e.g., `EU Central (Frankfurt)`)
   - Postgres Version: Latest (16)
3. Click **"Create Project"**
4. Wait for it to provision (~30 seconds)

### Step 4: Get Connection String

After creating/activating:
1. Click on your project
2. Go to **"Dashboard"** tab
3. Find **"Connection Details"**
4. Make sure:
   - Role: `neondb_owner`
   - Database: `neondb`
   - Connection pooling: **Enabled** (use the pooler endpoint)
5. Copy the connection string that looks like:
   ```
   postgresql://neondb_owner:XXXX@ep-XXXXX-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 5: Test Locally

```bash
cd /Users/ian/Desktop/BDD1/src

# Set the connection string (replace with yours)
export DATABASE_URL='postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-ENDPOINT-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'

# Push schema to Neon
npx prisma db push

# Test connection
npx tsx scripts/test-db-connection.ts
```

### Step 6: Create Your User in Production DB

```bash
# Still using the same DATABASE_URL from above
npx tsx scripts/ensure-user.ts
```

This will create your account (ilaurent@eugeniaschool.com) in the Neon database.

### Step 7: Update Vercel Environment Variables

1. Go to Vercel Dashboard: https://vercel.com
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add/Update these variables:

**Required:**
```
DATABASE_URL = postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-ENDPOINT-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

AUTH_SECRET = (generate with: openssl rand -base64 32)

AUTH_URL = https://your-vercel-url.vercel.app

NEXTAUTH_SECRET = (same as AUTH_SECRET)

NEXTAUTH_URL = (same as AUTH_URL)
```

**Optional (if using Google OAuth):**
```
GOOGLE_CLIENT_ID = your-client-id
GOOGLE_CLIENT_SECRET = your-client-secret
```

### Step 8: Deploy

```bash
git add .
git commit -m "Update auth and database configuration"
git push
```

Vercel will auto-deploy. Or click "Redeploy" in Vercel dashboard.

### Step 9: Create Account on Production

Once deployed:
1. Go to: `https://your-vercel-url.vercel.app/auth/signup`
2. Create your association account
3. Sign in!

## Common Issues

### "Can't reach database server"
- Database is paused → Wake it up in Neon console
- Wrong connection string → Get fresh one from Neon
- Network issue → Try from different network or use VPN

### "Database schema not synced"
Run: `DATABASE_URL='your-neon-url' npx prisma db push`

### "User not found" on production
Your local user won't exist in Neon database. Either:
- Option A: Create account via signup page on production
- Option B: Run `ensure-user.ts` script with Neon DATABASE_URL

## Important Notes

- **Local DB ≠ Production DB** - They are completely separate
- Neon free tier pauses databases after inactivity
- Always use the **pooler** connection string for better performance
- Include `?sslmode=require` in connection string
- Vercel needs the DATABASE_URL to be set in environment variables

## Quick Commands Reference

```bash
# Test Neon connection
DATABASE_URL='your-neon-url' npx tsx scripts/test-db-connection.ts

# Push schema to Neon
DATABASE_URL='your-neon-url' npx prisma db push

# Create user in Neon
DATABASE_URL='your-neon-url' npx tsx scripts/ensure-user.ts

# Generate Prisma client
npx prisma generate
```

## Next Steps

1. ✅ Wake up or create Neon database
2. ✅ Get fresh connection string
3. ✅ Push schema: `DATABASE_URL='...' npx prisma db push`
4. ✅ Test connection: `DATABASE_URL='...' npx tsx scripts/test-db-connection.ts`
5. ✅ Create user: `DATABASE_URL='...' npx tsx scripts/ensure-user.ts`
6. ✅ Update Vercel environment variables
7. ✅ Deploy to Vercel
8. ✅ Sign in on production!

Good luck! 🚀
