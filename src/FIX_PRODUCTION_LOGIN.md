# Fix Production Login Issue

## Problem
You can't sign in to the deployed version with ilaurent@eugeniaschool.com / admin123

## Root Cause
The production database on Vercel is **different** from your local database. Your local database has the user, but the production database might not.

## Solution

### Option 1: Run the User Creation Script on Production

You need to create the user in your **production database**:

1. **Connect to Production Database Locally**:
   
   Get your production DATABASE_URL from Vercel:
   - Go to Vercel Dashboard
   - Your project > Settings > Environment Variables
   - Copy the DATABASE_URL value

2. **Create a `.env.production.local` file**:
   ```bash
   DATABASE_URL="your-production-database-url-here"
   ```

3. **Run the user creation script with production DB**:
   ```bash
   # Load production env and run script
   export $(cat .env.production.local | xargs) && npx tsx scripts/ensure-user.ts
   ```

### Option 2: Create User via Production API

Create an API route to initialize users (safer approach):

1. Deploy the code with the new auth fixes
2. Use the signup page to create the account on production
3. Go to: `https://your-vercel-url.vercel.app/auth/signup`
4. Create account with:
   - Email: ilaurent@eugeniaschool.com
   - Password: admin123
   - Name: Ian Laurent
   - Account type: Association

### Option 3: Use Prisma Studio with Production DB

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="your-production-database-url"

# Open Prisma Studio
npx prisma studio

# Manually create or update the user in the browser
```

## Quick Fix for Testing

If you just want to test that auth works on production:

1. Go to your deployed site: `https://your-vercel-url.vercel.app/auth/signup`
2. Create a **new test account**
3. Use that to sign in

## Verify Auth is Working

After setting environment variables in Vercel:

1. ✅ AUTH_SECRET is set
2. ✅ AUTH_URL is set (e.g., https://your-vercel-url.vercel.app)
3. ✅ DATABASE_URL is set with ?sslmode=require
4. ✅ Code is deployed with the trustHost: true fix

Then test:
- Visit `/auth/signup` - should load without errors
- Create a test account
- Try signing in
- Should redirect to dashboard

## Important Notes

- **Local database ≠ Production database**
- Users created locally won't exist in production
- You need to create users in the production database separately
- Or use the signup flow on production to create accounts

## Recommended Approach

**Use the signup page on production** to create your account:
1. Go to: https://your-vercel-url.vercel.app/auth/signup
2. Fill in your details
3. Create the association account
4. Now you can sign in

This is the safest and most straightforward approach!
