# Quick Setup Guide - Cogniz MCP Server

## For Users (5 minutes)

### 1. Get Your API Key
- Go to https://cogniz.online
- Login → Settings → API Keys
- Copy your key (looks like: `mp_1_xxxxxxxxxxxx`)

### 2. Connect in Claude Web UI

**URL to add:**
```
https://cogniz-claude-mcp.onrender.com/mcp
```

**Steps:**
1. Claude → Settings → Connectors
2. Click "Add Custom Connector"
3. Enter URL above
4. Click "Advanced Settings"
5. Paste your API key
6. Click "Connect"

**Done!** You now have 5 memory tools in Claude.

### 3. Connect in ChatGPT

1. ChatGPT → Settings → Custom Connectors
2. Add connector:
   - Server URL: `https://cogniz-claude-mcp.onrender.com/mcp`
   - Auth: Bearer Token
   - Token: Your API key

### Test It

Ask Claude or ChatGPT:
- "Store this memory: Testing my Cogniz MCP server"
- "Show my Cogniz statistics"
- "Search my memories for 'test'"

You should see YOUR data, not anyone else's!

---

## For Server Owners (Deploy Your Own)

### Quick Deploy to Render

1. **Fork the GitHub repo:**
   ```
   https://github.com/cognizonline/Cogniz_Claude_MCP
   ```

2. **Create Render Web Service:**
   - Connect your forked repo
   - Build: `npm install && npm run build`
   - Start: `npm run start:remote`

3. **Environment Variables:**
   ```
   COGNIZ_BASE_URL = https://cogniz.online
   COGNIZ_PROJECT_ID = default
   ```
   ⚠️ **Do NOT set COGNIZ_API_KEY** - Users will provide their own!

4. **Share your URL** with users:
   ```
   https://your-service.onrender.com/mcp
   ```

Users add your URL + their API key = Per-user authentication ✅

---

## Troubleshooting

### "No API key provided"
→ You forgot to add your API key in connector settings

### "Authentication failed"
→ Your API key is invalid. Get a new one from cogniz.online

### Seeing wrong memories
→ Check you're using YOUR API key, not someone else's

### Still seeing shared account
→ Server needs to be redeployed with new authentication code

---

## Tools Available

1. **cogniz_store_memory** - Save information
2. **cogniz_search_memories** - Find memories
3. **cogniz_get_memory** - Retrieve specific memory
4. **cogniz_delete_memory** - Remove memory
5. **cogniz_get_stats** - View your statistics
6. **cogniz_list_projects** - See all projects

---

## Security

✅ Your API key is only sent to:
- Your AI assistant (Claude/ChatGPT)
- The MCP server (over HTTPS)
- cogniz.online (to access YOUR data)

✅ Your data is isolated:
- No other users can see your memories
- Each API key = one account
- Server doesn't store keys

---

## More Info

- Full docs: `USER_AUTHENTICATION.md`
- Server code: GitHub repository
- Cogniz Platform: https://cogniz.online
