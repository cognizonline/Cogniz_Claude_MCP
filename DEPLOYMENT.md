# Cogniz MCP Server - Deployment Guide

This guide covers deploying the Cogniz MCP Server as a **Remote MCP Server** for Claude Web UI.

## Overview

The Cogniz MCP Server can run in two modes:

1. **Local Mode** (stdio) - For Claude Code/Desktop
2. **Remote Mode** (HTTP/SSE) - For Claude Web UI

## Remote Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. **Create account** at [render.com](https://render.com)

2. **Create new Web Service**:
   - Connect your GitHub repository
   - Or use "Deploy from Git URL"

3. **Configure build settings**:
   ```
   Build Command: npm install && npm run build
   Start Command: npm run start:remote
   ```

4. **Set environment variables**:
   ```
   COGNIZ_API_KEY=your_api_key_here
   COGNIZ_BASE_URL=https://cogniz.online
   COGNIZ_PROJECT_ID=default
   PORT=3000
   ```

5. **Deploy** - Render will provide a URL like:
   ```
   https://cogniz-mcp-server.onrender.com
   ```

6. **Add to Claude Web UI**:
   - Go to Claude.ai → Settings → Connectors
   - Click "Add custom connector"
   - Enter: `https://cogniz-mcp-server.onrender.com/sse`

### Option 2: Railway

1. **Create account** at [railway.app](https://railway.app)

2. **New Project** → Deploy from GitHub

3. **Add environment variables**:
   ```
   COGNIZ_API_KEY=your_api_key_here
   COGNIZ_BASE_URL=https://cogniz.online
   COGNIZ_PROJECT_ID=default
   ```

4. **Deploy** - Railway auto-detects Node.js and builds

5. **Get your URL** from Railway dashboard

6. **Add to Claude**: `https://your-app.up.railway.app/sse`

### Option 3: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set environment variables** via Vercel dashboard

4. **Production URL**: `https://your-app.vercel.app/sse`

### Option 4: Heroku

1. **Create app**:
   ```bash
   heroku create cogniz-mcp-server
   ```

2. **Set environment variables**:
   ```bash
   heroku config:set COGNIZ_API_KEY=your_key
   heroku config:set COGNIZ_BASE_URL=https://cogniz.online
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

4. **URL**: `https://cogniz-mcp-server.herokuapp.com/sse`

### Option 5: Azure Functions

1. **Follow Microsoft's guide**: [Remote MCP with Azure Functions](https://learn.microsoft.com/en-us/samples/azure-samples/remote-mcp-functions-typescript/)

2. **Deploy** using Azure CLI

3. **URL**: `https://<function-app>.azurewebsites.net/runtime/webhooks/mcp/sse`

## Local Testing (Before Deployment)

1. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your API key**

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run in development mode**:
   ```bash
   npm run dev:remote
   ```

5. **Test SSE endpoint**:
   ```bash
   curl http://localhost:3000/health
   ```

6. **Test with MCP Inspector**:
   - Open another terminal
   - Navigate to the server directory
   - The SSE endpoint is at: `http://localhost:3000/sse`

## Adding to Claude Web UI

Once deployed, add your Remote MCP server to Claude:

1. **Open Claude** at [claude.ai](https://claude.ai)

2. **Go to Settings**:
   - Click your profile icon (top right)
   - Select "Settings"

3. **Open Connectors section**:
   - Click "Connectors" in the sidebar

4. **Add Custom Connector**:
   - Scroll to bottom
   - Click "Add custom connector"
   - Enter your server URL with `/sse` endpoint:
     ```
     https://your-server.com/sse
     ```

5. **Test it**:
   - Start a new conversation
   - Try: "Show my Cogniz statistics"
   - Claude should use your connector!

## Security Considerations

### API Key Protection

- **Never commit** `.env` file to Git
- Use environment variables in production
- Rotate API keys regularly

### CORS (if needed)

Add to `server-remote.ts` before routes:

```typescript
import cors from 'cors';
app.use(cors());
```

### Rate Limiting (recommended)

Install: `npm install express-rate-limit`

Add to `server-remote.ts`:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## Monitoring

### Health Check

Your server includes a health check endpoint:

```bash
curl https://your-server.com/health
```

Response:
```json
{
  "status": "healthy",
  "service": "cogniz-mcp-server"
}
```

### Logs

Check deployment platform logs:

- **Render**: Dashboard → Logs
- **Railway**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Deployments → Function Logs
- **Heroku**: `heroku logs --tail`

## Troubleshooting

### Connection Issues

1. **Check health endpoint**:
   ```bash
   curl https://your-server.com/health
   ```

2. **Verify environment variables** are set correctly

3. **Check logs** on your deployment platform

### API Errors

1. **403 Forbidden**: Check API key is valid
2. **404 Not Found**: Check endpoint URL includes `/sse`
3. **Timeout**: Check Cogniz API is accessible

### Claude Not Finding Tools

1. **Restart Claude** after adding connector
2. **Check connector status** in Settings → Connectors
3. **Verify server is running** (health check)

## Cost Estimates

### Free Tiers

- **Render**: 750 hours/month free (sleeps after 15min inactivity)
- **Railway**: $5 credit/month (enough for low usage)
- **Vercel**: 100GB-hours free (serverless functions)
- **Heroku**: Free tier discontinued, starts at $7/month

### Recommendation

**Start with Render** (free tier):
- Easy deployment
- Automatic SSL
- Custom domains
- Good for testing and low-to-medium usage

**Upgrade to Railway** for production:
- Better reliability
- No sleep on inactivity
- Better performance
- Simple pricing

## Next Steps

1. ✅ Deploy to your chosen platform
2. ✅ Add connector to Claude Web UI
3. ✅ Test with: "Show my Cogniz statistics"
4. ✅ Start using persistent memory in Claude!

## Support

For issues or questions:
- Check deployment platform documentation
- Review Cogniz API docs at cogniz.online
- Check MCP protocol docs at modelcontextprotocol.io
