# Deployment Notes - Cogniz MCP Server

## Current Limitation

**Claude Web UI and ChatGPT do not yet support sending custom Bearer tokens for MCP servers.**

As of October 2025:
- ✅ OAuth Client ID/Secret are supported (but we're not a full OAuth server)
- ❌ Simple Bearer token / API key input is NOT supported
- ❌ Custom headers are NOT supported

This means **users cannot provide their own API keys** when using the shared deployment at `https://cogniz-claude-mcp.onrender.com/mcp`.

## Current Setup (Shared Account)

The public server at `https://cogniz-claude-mcp.onrender.com/mcp` uses:
- **Single API key** from environment variable
- **Shared account** - all users see the same memories
- **No data isolation**

This is suitable for:
- ✅ Testing the MCP server
- ✅ Demos
- ❌ **NOT for production use**
- ❌ **NOT for private data**

## Solution: Deploy Your Own Instance

To have your own private MCP server with YOUR data:

### Option 1: Deploy to Render (Recommended)

1. **Fork the repository:**
   ```
   https://github.com/cognizonline/Cogniz_Claude_MCP
   ```

2. **Create Render Web Service:**
   - Connect your forked repo
   - Build command: `npm install && npm run build`
   - Start command: `npm run start:remote`

3. **Set Environment Variables:**
   ```
   COGNIZ_API_KEY = your_api_key_here
   COGNIZ_BASE_URL = https://cogniz.online
   COGNIZ_PROJECT_ID = default
   ```

4. **Get your MCP URL:**
   ```
   https://your-service-name.onrender.com/mcp
   ```

5. **Add to Claude/ChatGPT:**
   - Use YOUR server URL
   - Only YOU will access YOUR memories

### Option 2: Deploy to Other Platforms

**Cloudflare Workers:**
- Supports Streamable HTTP
- See: https://developers.cloudflare.com/agents/guides/remote-mcp-server/

**AWS Lambda:**
- Use API Gateway + Lambda
- Set environment variables

**Vercel:**
- Deploy as serverless function
- Set environment variables in Vercel dashboard

**Self-hosted:**
```bash
git clone https://github.com/cognizonline/Cogniz_Claude_MCP
cd cogniz-mcp-server
npm install
npm run build

# Set environment variables
export COGNIZ_API_KEY=your_key
export COGNIZ_BASE_URL=https://cogniz.online
export COGNIZ_PROJECT_ID=default

npm run start:remote
```

## When Will Per-User Auth Work?

The code is ready for per-user authentication! It will work when:

1. **Claude Web UI adds support** for:
   - Custom Bearer token input (not OAuth)
   - OR simple API key field
   - OR custom headers

2. **OR you use MCP Inspector:**
   - MCP Inspector supports custom headers
   - You can test per-user auth now with Inspector

3. **OR via CLI tools:**
   ```bash
   curl -X POST https://your-server.com/mcp \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"tools/list"}'
   ```

## Code Ready for Future

The server code is **already implemented** for per-user auth:
- ✅ Extracts Bearer token from Authorization header
- ✅ Uses user's API key for their requests
- ✅ Complete data isolation
- ✅ 401 challenges when no auth provided

When Claude/ChatGPT add support, users will be able to:
- Provide their API key when adding the connector
- Access only their own memories
- No shared accounts

## Temporary Workaround

Until per-user auth is supported:

**For Private Use:**
1. Deploy your own instance (see above)
2. Use YOUR API key in environment
3. Only YOU connect to your server

**For Team Use:**
1. Deploy separate instance per team
2. Use team API key in environment
3. All team members share that account

**For Public Demo:**
1. Use the public server
2. Accept that data is shared
3. Don't store sensitive information

## Security Recommendations

**Current Shared Server:**
- ❌ Do NOT store sensitive data
- ❌ Do NOT use for production
- ✅ Use for testing only
- ✅ Understand all users share memories

**Your Own Deployment:**
- ✅ Your API key only
- ✅ Your memories only
- ✅ Full control
- ✅ Can use for production

## FAQ

### Why not use OAuth Client Secret?
OAuth Client Secret in Claude is for **full OAuth servers** with authorization endpoints, token endpoints, etc. We're a simple API, not an OAuth provider.

### When will this be fixed?
When Claude/ChatGPT add support for:
- Simple Bearer token input
- OR custom header configuration
- OR API key field (not OAuth)

### Can I use this in production now?
**Only if you deploy your own instance** with your API key. Don't use the shared public server for production.

### Is my data safe on the shared server?
- Your API calls are encrypted (HTTPS)
- But all users share the same Cogniz account
- Anyone using the server sees the same memories
- Deploy your own instance for privacy

## Monitoring

If you deploy your own instance, check logs for:

```
User API key provided: mp_1_xxxxx...  ✅ (future: per-user auth working)
No user API key - using fallback: ✅ (current: using your key from env)
ERROR: No API key available: ❌ (server misconfigured)
```

## Updates

Follow the GitHub repository for updates:
- When Claude adds Bearer token support
- When ChatGPT adds API key fields
- When full OAuth is implemented

## Summary

**Today:**
- Shared account = Public server
- Your account = Deploy your own

**Future:**
- Shared server = Per-user auth
- Each user provides their own API key
- Complete data isolation

The code is ready. We're waiting for platform support! 🚀
