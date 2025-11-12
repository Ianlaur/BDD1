# Vercel Deployment Checklist

## Pre-Deployment

- [ ] All code tested locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: `npm run lint`

## Git Setup

- [ ] Commit all changes to `dev` branch
- [ ] Merge `dev` into `main` branch
- [ ] Push `main` to GitHub

```bash
# Commands:
cd /Users/ian/Desktop/BDD1/src
git status
git add .
git commit -m "Prepare for Vercel deployment"
git checkout main
git merge dev
git push origin main
```

## Vercel Setup

- [ ] Go to https://vercel.com/new
- [ ] Import GitHub repository: `Ianlaur/BDD1`
- [ ] **Set Root Directory to: `src`** ⚠️ IMPORTANT!
- [ ] Framework: Next.js (auto-detected)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)

## Environment Variables

Add these in Vercel Project Settings > Environment Variables:

### Required:

```
DATABASE_URL
postgresql://neondb_owner:npg_IE4b0PSHBwmz@ep-old-darkness-ag5157bg.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_SECRET
L+SUIpEcfs34XaDx8wsUi25QjlF/ZBJt/Viz6N8izWI=

NEXTAUTH_URL
https://your-project.vercel.app
(Update with your actual Vercel URL after first deployment)

NODE_ENV
production
```

- [ ] DATABASE_URL added
- [ ] NEXTAUTH_SECRET added
- [ ] NEXTAUTH_URL added (update after deployment)
- [ ] NODE_ENV added

## Deploy

- [ ] Click "Deploy" button
- [ ] Wait for build to complete (2-5 min)
- [ ] Note your Vercel URL

## Post-Deployment

- [ ] Update NEXTAUTH_URL with actual Vercel URL
- [ ] Redeploy to apply updated NEXTAUTH_URL
- [ ] Test sign in/sign up
- [ ] Test association browsing
- [ ] Test admin dashboard with: `admin@associationconnect.com` / `dev@2025`
- [ ] Verify database connection working

## Production Database Setup (Optional)

If you need to seed production database:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_IE4b0PSHBwmz@ep-old-darkness-ag5157bg.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require" npm run db:seed
```

## Branch Protection

The `vercel.json` ensures:
- ✅ `main` branch → Auto-deploys to production
- ❌ `dev` branch → No automatic deployments
- ❌ Other branches → No automatic deployments

## Your Deployment URLs

After deployment, you'll have:

- **Production**: https://your-project.vercel.app
- **Dashboard**: https://vercel.com/dashboard

## Test Accounts for Production

After seeding production database:

- **Platform Admin**: admin@associationconnect.com / dev@2025
- **Ian's Association**: ilaurent@eugeniaschool.com / admin123
- **Student**: john.doe@university.edu / password123

## Troubleshooting

### Build Fails
- Check root directory is set to `src`
- Verify all environment variables are set
- Check build logs in Vercel dashboard

### Database Connection Error
- Ensure `?sslmode=require` is in DATABASE_URL
- Verify Neon database is active
- Check DATABASE_URL has no typos

### Auth Not Working
- NEXTAUTH_URL must match your Vercel URL exactly (no trailing slash)
- NEXTAUTH_SECRET must be set
- Clear browser cookies and try again

## Next Steps

Once deployed:

1. [ ] Set up custom domain (optional)
2. [ ] Configure Google OAuth if needed
3. [ ] Monitor logs in Vercel dashboard
4. [ ] Set up monitoring/analytics
5. [ ] Share the live URL!

---

🎉 **Ready to Deploy!** Follow the checklist step by step.
