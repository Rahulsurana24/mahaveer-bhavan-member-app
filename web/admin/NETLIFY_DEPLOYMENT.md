# Netlify Deployment Guide - Mahaveer Bhavan Web Admin

Complete guide for deploying the Web Admin interface to Netlify.

## 🚀 Quick Deploy

### Option 1: Deploy from Git (Recommended)

This is the easiest and most automated way to deploy.

#### Step 1: Push to GitHub (if not already done)

```bash
cd /workspace/cmh6fofaa00b2psi3k3ds3j56
git add .
git commit -m "Prepare web admin for Netlify deployment"
git push origin main
```

#### Step 2: Connect to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up or log in with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **"Deploy with GitHub"**
5. Authorize Netlify to access your repositories
6. Select your repository: `mahaveer-bhavan`

#### Step 3: Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

- **Base directory:** `web/admin`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Branch to deploy:** `main`

Click **"Deploy site"**

#### Step 4: Add Environment Variables

After the first deploy, add your Supabase credentials:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add the following:

```
Key: VITE_SUPABASE_URL
Value: https://your-project.supabase.co

Key: VITE_SUPABASE_ANON_KEY
Value: your-supabase-anon-key-here
```

4. Click **"Deploy"** → **"Trigger deploy** → **"Clear cache and deploy site"**

#### Step 5: Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `admin.mahaverbhavan.org`)
4. Follow DNS configuration instructions
5. Netlify will automatically provision SSL certificate

---

### Option 2: Netlify CLI Deploy

Deploy directly from your terminal.

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify

```bash
netlify login
```

This will open a browser window to authenticate.

#### Step 3: Initialize Netlify

```bash
cd /workspace/cmh6fofaa00b2psi3k3ds3j56/web/admin
netlify init
```

Follow the prompts:
- Create a new site or link to existing
- Choose your team
- Site name: `mahaveer-bhavan-admin` (or your preference)

#### Step 4: Set Environment Variables

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-supabase-anon-key"
```

#### Step 5: Build and Deploy

```bash
# Test build locally first
npm run build

# Deploy to production
netlify deploy --prod
```

---

### Option 3: Manual Drag & Drop Deploy

Quick one-time deploy for testing.

#### Step 1: Build Locally

```bash
cd /workspace/cmh6fofaa00b2psi3k3ds3j56/web/admin

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with static files.

#### Step 2: Create .env for Build

Before building, create `.env` file:

```bash
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
EOF
```

Then rebuild:
```bash
npm run build
```

#### Step 3: Deploy to Netlify

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the `dist/` folder
3. Your site will be live at a random URL like `random-name-123.netlify.app`

**Note:** This method requires manual redeployment for updates. Use Git deploy for automatic updates.

---

## 🔧 Configuration Details

### netlify.toml

The `netlify.toml` file in the web/admin directory configures:

- **Base directory:** `web/admin` (where package.json is)
- **Build command:** `npm run build` (runs Vite build)
- **Publish directory:** `dist` (Vite output folder)
- **Redirects:** All routes redirect to index.html for SPA routing
- **Headers:** Security headers (X-Frame-Options, CSP, etc.)
- **Caching:** Long-term caching for assets (31536000s = 1 year)

### Client-Side Routing

The `_redirects` file ensures React Router works correctly:

```
/*    /index.html   200
```

This tells Netlify to serve `index.html` for all routes, allowing React Router to handle routing.

---

## ✅ Verification Checklist

After deployment, verify these work:

- [ ] Login page loads: `https://your-site.netlify.app/`
- [ ] Admin login works with correct credentials
- [ ] Role verification prevents non-admin access
- [ ] Dashboard displays after login
- [ ] Navigation between pages works (Dashboard, Gallery, Members, etc.)
- [ ] Logout functionality works
- [ ] Direct URL navigation works (e.g., `/dashboard`, `/gallery`)
- [ ] Refresh on any page doesn't cause 404
- [ ] Mobile responsive design works
- [ ] Dark mode theme displays correctly

---

## 🔐 Security Best Practices

### Environment Variables

**NEVER commit these to Git:**
- `.env` file (already in .gitignore)
- Supabase keys
- Any sensitive credentials

**Always use Netlify Environment Variables UI** for production secrets.

### Supabase Configuration

Your Supabase URL and anon key are safe to expose in client-side code because:
1. Anon key has limited permissions (Row Level Security enforced)
2. Admin access requires authentication + role verification
3. Sensitive operations should use Supabase Edge Functions

### Additional Security

The `netlify.toml` sets these security headers:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `X-Content-Type-Options: nosniff` - MIME type sniffing protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer control

---

## 🚦 Build Status Badge

Add a build status badge to your README:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```

Get your site ID from: Site settings → General → Site details → API ID

---

## 🔄 Continuous Deployment

Once connected to Git, Netlify automatically:

✅ **Builds on every push to main**
- Detects changes in `web/admin/` directory
- Runs `npm install` and `npm run build`
- Deploys to production

✅ **Creates deploy previews for pull requests**
- Every PR gets its own preview URL
- Test changes before merging
- Automatically deleted when PR is merged/closed

✅ **Provides deployment notifications**
- Email notifications on build success/failure
- Slack/Discord integrations available
- GitHub commit status checks

---

## 🐛 Troubleshooting

### Build Fails with "Module not found"

**Issue:** Dependencies not installed correctly

**Solution:**
```bash
# Clear node_modules and reinstall
cd web/admin
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build

# Push changes
git add package-lock.json
git commit -m "Fix dependencies"
git push
```

### "404 Not Found" on Direct URL Access

**Issue:** Client-side routing not configured

**Solution:** Ensure `_redirects` file exists in `public/` folder or `dist/` folder

### Environment Variables Not Working

**Issue:** Variables not set in Netlify dashboard

**Solution:**
1. Go to Site settings → Environment variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Important: Variable names MUST start with `VITE_` for Vite
4. Trigger a new deploy after adding variables

### Build Works Locally but Fails on Netlify

**Issue:** Node version mismatch

**Solution:** netlify.toml specifies Node 18. Verify locally:
```bash
node --version  # Should be 18+
```

### Login Works but API Calls Fail

**Issue:** CORS or Supabase configuration

**Solution:**
1. Check Supabase dashboard → Authentication → URL Configuration
2. Add your Netlify URL to allowed redirect URLs
3. Verify environment variables are set correctly

---

## 📊 Performance Optimization

### Vite Build Optimization

Already configured in `vite.config.ts`:
- Code splitting
- Tree shaking
- Minification
- Source maps for debugging

### Netlify Performance Features

Automatically enabled:
- **CDN:** Global edge network
- **HTTP/2:** Faster loading
- **Brotli compression:** Smaller file sizes
- **Asset optimization:** Image and font optimization
- **Prerendering:** Static page generation

### Additional Optimizations

Consider adding:
- **Lazy loading:** For dashboard charts
- **Image optimization:** Use WebP format
- **Bundle analysis:** Run `npm run build -- --mode analyze`

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Netlify

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain: `admin.mahaverbhavan.org`

### Step 2: Configure DNS

#### Option A: Use Netlify DNS (Recommended)

1. Netlify provides nameservers (e.g., `dns1.p03.nsone.net`)
2. Update nameservers at your domain registrar
3. Netlify automatically manages DNS records
4. SSL certificate auto-provisions

#### Option B: Keep Existing DNS Provider

Add these DNS records at your provider:

**For root domain (mahaverbhavan.org):**
```
Type: A
Name: admin
Value: 75.2.60.5  # Netlify load balancer IP
```

**Or use CNAME:**
```
Type: CNAME
Name: admin
Value: your-site-name.netlify.app
```

### Step 3: Wait for DNS Propagation

- DNS changes take 24-48 hours to fully propagate
- Check status: `dig admin.mahaverbhavan.org`
- Netlify will show "DNS configured" when ready

### Step 4: Enable HTTPS

- Netlify automatically provisions Let's Encrypt SSL
- Usually takes 1-2 minutes after DNS is configured
- Enable "Force HTTPS" in domain settings

---

## 📱 Post-Deployment Tasks

After successful deployment:

1. **Update documentation** with live URL
2. **Share URL** with admin team
3. **Create admin accounts** in Supabase
4. **Test all features** in production
5. **Monitor Netlify analytics** for usage
6. **Set up alerts** for build failures
7. **Configure backup strategy** for data

---

## 💰 Netlify Pricing

**Free Tier (Starter):**
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ HTTPS with custom domain
- ✅ Continuous deployment
- ✅ Perfect for this admin portal

**Paid Plans (if needed):**
- Pro: $19/month (1 TB bandwidth, 1000 build minutes)
- Business: $99/month (advanced features)

For a web admin portal, the free tier should be sufficient.

---

## 📞 Support Resources

- **Netlify Documentation:** https://docs.netlify.com
- **Netlify Community:** https://answers.netlify.com
- **Netlify Status:** https://www.netlifystatus.com
- **Vite Documentation:** https://vitejs.dev
- **React Router:** https://reactrouter.com
- **Supabase Docs:** https://supabase.com/docs

---

## ✅ Success Checklist

After completing deployment:

- [ ] Site deployed successfully to Netlify
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enabled
- [ ] Environment variables set correctly
- [ ] Login functionality verified
- [ ] All routes accessible
- [ ] Mobile responsive tested
- [ ] Admin operations working
- [ ] Build notifications configured
- [ ] Team members have access

---

**Deployment Status:** Ready to deploy! 🚀

**Estimated Time:** 10-15 minutes for first deployment

**Difficulty:** Easy (guided process)

**Next Steps:** Choose your deployment method above and follow the steps!
