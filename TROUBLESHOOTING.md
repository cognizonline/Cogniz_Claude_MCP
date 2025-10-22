# Troubleshooting Guide

## Build Errors

### Error: "No inputs were found in config file"

```
error TS18003: No inputs were found in config file 'tsconfig.json'.
Specified 'include' paths were '["src/**/*"]'
```

**Solution**: Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],          // Changed from ["src/**/*"]
  "exclude": ["node_modules", "dist"]
}
```

**Why it happens**: The build command is run from the project root, but `include: ["src/**/*"]` looks for `src/src/` (double nesting).

**Test locally**:
```bash
npm run build
```

Should complete without errors and create `dist/server-remote.js`.

---

### Error: "Cannot find module 'express'"

```
Error: Cannot find module 'express'
```

**Solution**: Install dependencies:

```bash
npm install
```

**Why it happens**: `node_modules/` folder missing. This shouldn't happen on Render as it runs `npm install` automatically.

---

### Error: Module not found in imports

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'/opt/render/project/src/dist/server-remote.js'
```

**Solution**: Check `package.json` start command:

```json
{
  "scripts": {
    "start:remote": "node dist/server-remote.js"
  }
}
```

NOT `node src/dist/server-remote.js` (wrong path).

---

## Deployment Errors

### Error: "COGNIZ_API_KEY environment variable is required"

```
Error: COGNIZ_API_KEY environment variable is required
```

**Solution**: Set environment variable in Render dashboard:

1. Go to your service on Render
2. Click "Environment" tab
3. Find `COGNIZ_API_KEY`
4. Add value: `mp_1_PhVJHnsiWuV7H6x81SnM0n3KCPVobFse`
5. Click "Save Changes"
6. Render will automatically redeploy

---

### Error: Service keeps crashing

**Check Render logs**:
1. Go to your service
2. Click "Logs" tab
3. Look for error messages

**Common causes**:
- Missing environment variable (see above)
- Port binding issue (Render sets PORT automatically)
- Import errors (check TypeScript compiled correctly)

**Solution**: Check if server starts locally:

```bash
# Set environment variables
export COGNIZ_API_KEY=mp_1_PhVJHnsiWuV7H6x81SnM0n3KCPVobFse
export PORT=3000

# Run the server
npm run start:remote
```

Should output:
```
Cogniz Remote MCP Server running on port 3000
SSE endpoint: http://localhost:3000/sse
Health check: http://localhost:3000/health
```

---

### Error: 404 Not Found when accessing service

**Check URL**:
- ✅ Correct: `https://cogniz-mcp-server.onrender.com/health`
- ❌ Wrong: `https://cogniz-mcp-server.onrender.com` (no path)

**Test health endpoint**:
```bash
curl https://your-service.onrender.com/health
```

Should return:
```json
{"status":"healthy","service":"cogniz-mcp-server"}
```

---

## Claude Connection Errors

### Error: "Cannot connect to connector"

**Checklist**:

1. **Verify URL format**:
   ```
   ✅ https://cogniz-mcp-server.onrender.com/sse
   ❌ https://cogniz-mcp-server.onrender.com (missing /sse)
   ❌ http://cogniz-mcp-server.onrender.com/sse (http instead of https)
   ```

2. **Check service is running**:
   - Go to Render dashboard
   - Green dot = running
   - Red dot = crashed (check logs)

3. **Test health endpoint**:
   ```bash
   curl https://your-service.onrender.com/health
   ```

4. **Restart Claude**:
   - Refresh browser
   - Or start new conversation

---

### Error: "Tools not showing up in Claude"

**Solution**:

1. **Verify connector is added**:
   - Claude.ai → Settings → Connectors
   - Should see your connector listed

2. **Check connector status**:
   - Look for green checkmark = connected
   - Red X = connection failed

3. **Remove and re-add**:
   - Click three dots on connector
   - Select "Remove"
   - Click "Add custom connector" again
   - Enter URL: `https://your-service.onrender.com/sse`

4. **Test with explicit request**:
   ```
   Use the cogniz_get_stats tool to show my Cogniz statistics
   ```

---

### Error: API calls failing with 403/401

**Check in Render logs**:
```
Error: API request failed with status 403: Forbidden
```

**Solution**: Verify API key:

1. **In Render dashboard**:
   - Environment tab
   - Check `COGNIZ_API_KEY` value
   - Should be: `mp_1_PhVJHnsiWuV7H6x81SnM0n3KCPVobFse`

2. **Test API key directly**:
   ```bash
   curl -H "Authorization: Bearer mp_1_PhVJHnsiWuV7H6x81SnM0n3KCPVobFse" \
        https://cogniz.online/wp-json/memory/v1/user-stats
   ```

3. **Check Cogniz platform**:
   - Go to https://cogniz.online
   - Settings → API Keys
   - Verify key is active and not expired

---

## Runtime Errors

### Error: "Request timeout"

```
Error: Request timed out. Please try again.
```

**Possible causes**:
1. **Render free tier sleep**: First request after 15 min takes ~30 seconds
2. **Cogniz API slow**: Network issues
3. **Large memory search**: Searching 1000s of memories

**Solutions**:
- **Wait and retry**: Subsequent requests will be faster
- **Upgrade Render plan**: $7/mo removes sleep
- **Reduce search limit**: Use `limit: 10` instead of `limit: 100`

---

### Error: "Memory search returns 400"

```
{"code":"missing_parameters","message":"project_id is required."}
```

**Solution**: This is already fixed in `server-remote.ts`:

```typescript
const searchParams: Record<string, string> = {
  query: params.query,
  limit: params.limit.toString(),
  project_id: params.project_id || config.project_id || "default"
};
```

If you still get this error:
1. Rebuild: `npm run build`
2. Redeploy to Render
3. Verify `dist/server-remote.js` has the fix

---

## Free Tier Limitations

### Service "sleeps" after 15 minutes

**Symptoms**:
- First request after inactivity takes 20-30 seconds
- Subsequent requests are fast

**This is normal** on Render free tier.

**Solutions**:
- **Accept it**: Fine for testing/personal use
- **Upgrade**: $7/mo Starter plan removes sleep
- **Keep-alive**: Set up external ping service (not recommended, wastes resources)

**Recommendation**: Accept sleep for testing, upgrade for production.

---

### Build time limit exceeded

**Symptoms**:
```
Build exceeded time limit (15 minutes)
```

**This shouldn't happen** with our lightweight server (~30 second build).

**If it does**:
1. Check you're not including huge files
2. Verify `node_modules/` is in `.gitignore`
3. Check Render status page for platform issues

---

## GitHub Issues

### Error: Push rejected

```
error: failed to push some refs to 'github.com/username/repo.git'
```

**Solution**: Pull first, then push:

```bash
git pull origin main
git push origin main
```

---

### Error: Large files rejected

```
remote: error: File too large
```

**Solution**: Add to `.gitignore`:

```
node_modules/
dist/
.env
*.log
```

Then:
```bash
git rm -r --cached node_modules dist
git commit -m "Remove large files"
git push origin main
```

---

## Getting Help

If none of these solutions work:

1. **Check Render docs**: https://render.com/docs
2. **Check MCP docs**: https://modelcontextprotocol.io
3. **Check Cogniz docs**: https://cogniz.online/docs
4. **Render support**: Dashboard → Help & Support
5. **Share logs**: Copy relevant error messages from Render logs

---

## Useful Commands

### Local Testing
```bash
# Build
npm run build

# Run local MCP server
npm run start

# Run remote MCP server (with env vars)
export COGNIZ_API_KEY=your_key
npm run start:remote

# Test health endpoint
curl http://localhost:3000/health
```

### Render Deployment
```bash
# Push to GitHub
git add .
git commit -m "Update server"
git push origin main

# Render auto-deploys when you push
```

### Testing Endpoints
```bash
# Health check
curl https://your-service.onrender.com/health

# Test API key (replace with your key)
curl -H "Authorization: Bearer mp_1_PhVJHnsiWuV7H6x81SnM0n3KCPVobFse" \
     https://cogniz.online/wp-json/memory/v1/user-stats
```

---

**Most common issue**: Wrong URL in Claude (missing `/sse` at the end)

**Second most common**: Missing `COGNIZ_API_KEY` environment variable

**Third most common**: Render free tier sleep causing slow first request

All of these are easy to fix! 🚀
