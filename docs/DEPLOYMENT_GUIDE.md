# 🚀 Deployment Guide - Briza UI React Dashboard

## Quick Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push your code to GitHub:

```bash
git init
git add .
git commit -m "feat: complete dashboard implementation"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect Vite and deploy!

---

## Pre-Deployment Checklist

### ✅ Build Verification

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check

# Build for production
npm run build

# Test production build locally
npm run preview
```

### ✅ Configuration Files Ready

- ✅ `vercel.json` - Configured with proper headers and rewrites
- ✅ `vite.config.ts` - Production optimizations enabled
- ✅ `tsconfig.json` - Strict mode enabled
- ✅ `.gitignore` - Excludes node_modules and build artifacts

---

## Environment Variables (Optional)

If you need environment variables, create `.env.production`:

```env
VITE_APP_NAME=Briza UI Dashboard
VITE_API_URL=https://api.example.com
VITE_ENABLE_ANALYTICS=true
```

---

## Performance Checklist

### Build Optimizations

- ✅ Code splitting enabled (lazy loading routes)
- ✅ Tree shaking active
- ✅ CSS modules for zero-runtime cost
- ✅ Manual chunks for vendor code
- ✅ Minification enabled
- ✅ Gzip compression (via Vercel)

### Bundle Analysis

```bash
# Generate bundle analysis
npm run build

# Check build output
ls -lh dist/assets
```

Expected bundle sizes:

- Main chunk: ~80-120 KB (gzipped)
- Vendor chunks: ~200-300 KB total (gzipped)
- Individual routes: 20-50 KB each (gzipped)

---

## Vercel Configuration

The `vercel.json` file includes:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Post-Deployment Tasks

### 1. Verify Core Features

- [ ] Dashboard loads correctly
- [ ] Navigation works (all routes)
- [ ] Web Vitals monitoring active
- [ ] Charts render properly
- [ ] Theme toggle works
- [ ] Sidebar responsive on mobile
- [ ] All pages accessible

### 2. Performance Verification

```bash
# Run Lighthouse audit
npm install -g lighthouse

# Test production URL
lighthouse https://your-deployment-url.vercel.app --view
```

Target scores:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### 3. Core Web Vitals Check

Visit: https://pagespeed.web.dev/

Target metrics:

- LCP: < 2.5s (Good)
- FID/INP: < 100ms (Good)
- CLS: < 0.1 (Good)

---

## Custom Domain (Optional)

### Add Custom Domain in Vercel:

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning (~24 hours)

---

## Monitoring & Analytics

### Add Vercel Analytics (Free)

```bash
npm install @vercel/analytics
```

Update `main.tsx`:

```typescript
import { Analytics } from "@vercel/analytics/react";

// Add to root
<Analytics />;
```

### Track Core Web Vitals

The dashboard already tracks Web Vitals internally. To send to external service:

```typescript
// In useCoreWebVitals hook
const reportWebVital = (metric: Metric) => {
  // Send to analytics service
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify(metric),
  });
};
```

---

## Rollback Strategy

If deployment has issues:

```bash
# Rollback to previous deployment
vercel rollback
```

Or via Vercel Dashboard:

1. Go to Deployments tab
2. Find previous working deployment
3. Click "Promote to Production"

---

## Continuous Deployment

Vercel auto-deploys on every push to main branch:

```bash
# Development deployment
git push origin feature-branch
# Creates preview URL

# Production deployment
git push origin main
# Deploys to production
```

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### 404 Errors on Routes

- ✅ Already configured in `vercel.json` with rewrites

### Slow Initial Load

- Check bundle sizes: `npm run build -- --analyze`
- Verify code splitting is working
- Enable Vercel's Edge Network (automatic)

### TypeScript Errors

```bash
# Fix type issues
npm run type-check
```

---

## Production URLs

After deployment, you'll get:

- **Production:** `https://your-project.vercel.app`
- **Preview:** `https://your-project-git-branch.vercel.app` (per branch)
- **Custom:** `https://your-domain.com` (if configured)

---

## Success Criteria

✅ **Deployment Successful When:**

- Build completes without errors
- All pages load correctly
- Performance score > 90
- Web Vitals in "Good" range
- Mobile responsive works
- Dark mode toggle functional
- Real-time monitoring active

---

## Next Steps After Deployment

1. **Share the URL:**

   - Add to your portfolio
   - Share on LinkedIn/Twitter
   - Include in resume

2. **Monitor Performance:**

   - Check Vercel Analytics
   - Review Core Web Vitals
   - Monitor error logs

3. **Iterate:**
   - Add more features
   - Optimize based on real data
   - Gather user feedback

---

**Ready to Deploy? Run:** `vercel --prod`

🚀 **Good luck with your deployment!**
