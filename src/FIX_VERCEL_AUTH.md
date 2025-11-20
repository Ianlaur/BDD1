# Fix Authentication on Vercel

## Issue
Getting "Application error: a server-side exception has occurred" when trying to sign in on the deployed version.

## Root Cause
NextAuth.js v5 requires different environment variable names than v4:
- `AUTH_SECRET` instead of `NEXTAUTH_SECRET`
- `AUTH_URL` instead of `NEXTAUTH_URL`

## Solution

### Step 1: Update Environment Variables in Vercel

Go to your Vercel project settings and add/update these environment variables:

1. **AUTH_SECRET** (Required)
   ```
   Generate a new secret: openssl rand -base64 32
   ```
   - Copy the output and set it as `AUTH_SECRET`

2. **AUTH_URL** (Required for production)
   ```
   https://your-vercel-url.vercel.app
   ```
   - Use your exact Vercel deployment URL
   - **NO trailing slash**

3. **Keep backward compatibility** (Optional but recommended)
   - Also set `NEXTAUTH_SECRET` to the same value as `AUTH_SECRET`
   - Also set `NEXTAUTH_URL` to the same value as `AUTH_URL`

4. **Database URL** (Should already be set)
   ```
   DATABASE_URL=postgresql://...?sslmode=require
   ```

5. **Google OAuth** (Optional - only if using Google Sign-in)
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### Step 2: Redeploy

After adding the environment variables:
1. Go to Vercel Dashboard
2. Navigate to Deployments tab
3. Click "Redeploy" on the latest deployment
4. Or push a new commit to trigger a deployment

### Step 3: Test Sign In

1. Go to your deployed URL
2. Try signing in with your credentials
3. If you still get errors, check the Vercel logs:
   - Go to your Vercel project
   - Click on the deployment
   - Go to "Runtime Logs" tab
   - Look for any error messages

## Quick Fix Commands

### Generate a new AUTH_SECRET:
```bash
openssl rand -base64 32
```

### Set environment variables in Vercel CLI:
```bash
vercel env add AUTH_SECRET production
# Paste the generated secret

vercel env add AUTH_URL production
# Enter: https://your-vercel-url.vercel.app
```

## Verification Checklist

- [ ] `AUTH_SECRET` is set in Vercel
- [ ] `AUTH_URL` matches your Vercel URL exactly (no trailing slash)
- [ ] `DATABASE_URL` is set with `?sslmode=require`
- [ ] Redeployed after adding environment variables
- [ ] Can access the sign-in page
- [ ] Can successfully sign in
- [ ] No server-side errors in Vercel logs

## Common Issues

### Still getting errors?

1. **Check Vercel Logs**
   - Look for specific error messages in Runtime Logs
   
2. **Database Connection**
   - Make sure your DATABASE_URL includes `?sslmode=require`
   - Test the connection string locally first

3. **Wrong AUTH_URL**
   - Must match your deployment URL exactly
   - Should be HTTPS in production
   - No trailing slash

4. **Missing AUTH_SECRET**
   - This is required and must be set
   - Should be a random string (32+ characters)

5. **Google OAuth Issues**
   - If using Google sign-in, make sure:
   - Authorized redirect URIs in Google Console include:
     - `https://your-vercel-url.vercel.app/api/auth/callback/google`
   - Both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

## Need More Help?

Check the Vercel Runtime Logs for specific error messages and share them for more targeted troubleshooting.
