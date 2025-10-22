# Quick Deploy to Render - 5 Minutes

## Files You Need

Only these 5 files are required:

```
✅ src/server-remote.ts      (The server code)
✅ package.json              (Dependencies)
✅ package-lock.json         (Locked versions)
✅ tsconfig.json             (TypeScript config)
✅ render.yaml               (Render config)
```

## Step-by-Step Deployment

### Method 1: GitHub (Best for Production)

1. **Create GitHub repo**:
   ```bash
   cd cogniz-mcp-server
   git init
   git add src/server-remote.ts package.json package-lock.json tsconfig.json render.yaml .gitignore
   git commit -m "Initial commit - Cogniz Remote MCP Server"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/cogniz-mcp-server.git
   git push -u origin main
   ```

2. **Go to Render.com**:
   - Sign up/login at https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the `cogniz-mcp-server` repository

3. **Render auto-detects** settings from `render.yaml`:
   - Name: `cogniz-mcp-server`
   - Build: `npm install && npm run build`
   - Start: `npm run start:remote`
   - Plan: Free

4. **Set environment variable**:
   - Click "Environment" tab
   - Find `COGNIZ_API_KEY`
   - Click "Generate" or paste: `mp_1_PhVJHnsiWuV7H6x81SnM0n3KCPVobFse`

5. **Click "Create Web Service"**
   - Render builds and deploys automatically
   - Wait 2-3 minutes
   - Get your URL: `https://cogniz-mcp-server.onrender.com`

### Method 2: Manual Upload (Quick Test)

1. **Zip the required files**:
   ```bash
   # Create a zip with only the needed files
   cd cogniz-mcp-server
   # On Windows PowerShell:
   Compress-Archive -Path src,package.json,package-lock.json,tsconfig.json,render.yaml -DestinationPath cogniz-mcp-deploy.zip
   ```

2. **Go to Render.com**:
   - Click "New +" → "Web Service"
   - Select "Build and deploy from a Git repository"
   - (You'll still need GitHub for this)

Actually, Render requires a Git repository. Let me give you the GitHub method:

## Recommended: GitHub Deployment

### Quick Commands

```bash
# Navigate to the MCP server directory
cd "C:\Users\Savannah Babette\skills\cogniz-memory-skills\cogniz-mcp-server"

# Initialize git (if not already done)
git init

# Add files for deployment
git add src/server-remote.ts
git add package.json
git add package-lock.json
git add tsconfig.json
git add render.yaml
git add .gitignore
git add README.md
git add DEPLOYMENT.md

# Commit
git commit -m "Remote MCP server ready for deployment"

# Create GitHub repo (do this on GitHub.com first)
# Then connect it:
git remote add origin https://github.com/YOUR-USERNAME/cogniz-mcp-server.git
git branch -M main
git push -u origin main
```

### On Render.com

1. **Sign up**: https://render.com (free account)

2. **New Web Service**:
   - Click "New +" button (top right)
   - Select "Web Service"
   - Click "Connect a repository"
   - Authorize GitHub
   - Select your `cogniz-mcp-server` repo

3. **Render Auto-Configures** (from render.yaml):
   - ✅ Name: `cogniz-mcp-server`
   - ✅ Build Command: `npm install && npm run build`
   - ✅ Start Command: `npm run start:remote`
   - ✅ Health Check: `/health`

4. **Add Secret**:
   - Scroll to "Environment Variables"
   - Find `COGNIZ_API_KEY`
   - Click to edit
   - Paste: `mp_1_PhVJHnsiWuV7H6x81SnM0n3KCPVobFse`

5. **Deploy**:
   - Click "Create Web Service" (bottom)
   - Wait 2-3 minutes for build
   - URL appears: `https://cogniz-mcp-server.onrender.com`

## Test Your Deployment

### 1. Health Check

```bash
curl https://cogniz-mcp-server.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "cogniz-mcp-server"
}
```

### 2. Add to Claude Web UI

1. Go to https://claude.ai
2. Click profile icon → Settings
3. Click "Connectors" in sidebar
4. Scroll to bottom
5. Click "Add custom connector"
6. Enter: `https://cogniz-mcp-server.onrender.com/sse`
7. Click "Add"

### 3. Test in Claude

Start a new conversation:

```
You: "Show my Cogniz statistics"
Claude: [Uses cogniz_get_stats tool]

        # Cogniz Platform Statistics

        **Plan**: Enterprise Plan
        **Projects**: 28
        **Total Memories**: 147
```

## Troubleshooting

### Build Fails

Check Render logs:
- Click on your service
- Click "Logs" tab
- Look for errors

Common issues:
- Missing files → Check GitHub repo has all required files
- Wrong Node version → Render uses Node 18+ (specified in render.yaml)

### Deployment Succeeds but Tools Don't Work

1. **Check environment variables**:
   - Go to "Environment" tab
   - Verify `COGNIZ_API_KEY` is set

2. **Check health endpoint**:
   ```bash
   curl https://your-service.onrender.com/health
   ```

3. **Check Render logs** for API errors

### Claude Can't Connect

1. **Verify URL** ends with `/sse`:
   ```
   https://cogniz-mcp-server.onrender.com/sse
   ✅ Correct

   https://cogniz-mcp-server.onrender.com
   ❌ Wrong - missing /sse
   ```

2. **Check service is running**:
   - Green dot on Render dashboard = running
   - Red dot = crashed (check logs)

3. **Restart Claude**:
   - Refresh the browser
   - Or start a new conversation

## Free Tier Limitations

Render free tier:
- ✅ 750 hours/month (plenty for testing)
- ⚠️  Sleeps after 15 min inactivity
- ⚠️  First request after sleep takes ~30 seconds
- ⚠️  Shared CPU/memory

For production:
- Upgrade to $7/month "Starter" plan
- No sleep
- Dedicated resources
- Better performance

## Cost Comparison

| Platform | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Render   | 750 hrs/mo (sleeps) | $7/mo (no sleep) |
| Railway  | $5 credit/mo | $0.000463/GB-s |
| Vercel   | 100 GB-hrs | $20/mo |
| Heroku   | None | $7/mo |

**Recommendation**: Start with Render free tier, upgrade to $7/mo when ready for production.

## Next Steps After Deployment

1. ✅ Test all 5 tools in Claude Web UI
2. ✅ Verify memory persistence across sessions
3. ✅ Monitor Render logs for errors
4. ✅ Set up custom domain (optional)
5. ✅ Add monitoring/analytics (optional)

---

**You're now running a production Remote MCP server!** 🚀
