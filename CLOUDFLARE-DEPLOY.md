# Deploy MoonTax to Cloudflare Pages

## ✅ Cloudflare Adapter Installed!

Your Astro site is now configured for Cloudflare Pages deployment.

## 🚀 Two Deployment Options

### Option 1: Deploy via Cloudflare Dashboard (Recommended - Easiest)

1. **Go to Cloudflare Pages**
   - Visit: https://pages.cloudflare.com
   - Log in or create a free account

2. **Connect to GitHub**
   - Click "Create a project"
   - Click "Connect to Git"
   - Authorize Cloudflare to access your GitHub
   - Select your repository: `Boof-willis/moontax`

3. **Configure Build Settings**
   - **Project name**: `moontax` (or your preferred name)
   - **Production branch**: `main`
   - **Framework preset**: Select "Astro"
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - Click "Save and Deploy"

4. **Wait for Deployment** (usually 1-2 minutes)
   - Cloudflare will build and deploy your site
   - You'll get a URL like: `moontax.pages.dev`

5. **Done!** 🎉
   - Your site is live on Cloudflare's global CDN
   - Auto-deploys on every push to `main` branch

---

### Option 2: Deploy via Wrangler CLI (For Advanced Users)

If you prefer command-line deployment:

1. **Install Wrangler** (Cloudflare CLI)
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   npx wrangler pages deploy dist
   ```

---

## 🔧 What Was Configured

✅ **Cloudflare adapter** added to `astro.config.mjs`  
✅ **wrangler.jsonc** created for Cloudflare configuration  
✅ **public/.assetsignore** added for asset optimization  

---

## 🌐 Custom Domain (Optional)

Once deployed, you can add a custom domain:

1. Go to your Cloudflare Pages project
2. Click "Custom domains"
3. Add your domain (e.g., `moontax.com`)
4. Follow DNS setup instructions
5. Cloudflare provides free SSL certificates!

---

## 🔄 Automatic Deployments

After initial setup, every time you push to GitHub:
```bash
git add .
git commit -m "Update site"
git push
```

Cloudflare Pages will automatically:
- Build your site
- Deploy to production
- Update your live site (usually in 1-2 minutes)

---

## 📊 Deployment Features You Get

✅ **Global CDN**: Fast loading worldwide  
✅ **Free SSL**: Automatic HTTPS  
✅ **Unlimited bandwidth**: No traffic limits  
✅ **Preview deployments**: Every branch gets a preview URL  
✅ **Rollbacks**: Easy to revert to previous deployments  
✅ **Analytics**: Built-in Web Analytics (privacy-friendly)  

---

## 🎯 Next Steps

1. **Deploy Now**: Go to https://pages.cloudflare.com
2. **Connect Your Repo**: Link `Boof-willis/moontax`
3. **Configure Build**: Use settings above
4. **Deploy**: Click deploy and wait ~2 minutes
5. **Share Your URL**: `moontax.pages.dev` will be live!

---

## 🆘 Troubleshooting

**Build fails?**
- Check that Node.js version is 18+ in Cloudflare settings
- Environment variables → `NODE_VERSION` = `18`

**Assets not loading?**
- Cloudflare automatically handles static assets
- Check the `public/` folder is committed to git

**Need help?**
- Cloudflare Docs: https://developers.cloudflare.com/pages/framework-guides/astro/
- Astro Docs: https://docs.astro.build/en/guides/deploy/cloudflare/

---

## 🚀 You're Ready to Deploy!

Head over to https://pages.cloudflare.com and get your site live in minutes!

