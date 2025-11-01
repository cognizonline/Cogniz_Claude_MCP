# 🚀 Quick Reference - Cogniz MCP Integration

## ✅ Your Domain is LIVE: `https://app.cogniz.online`

---

## 📱 For Claude Desktop (Most Secure)

### Where to Update:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

### Configuration:
```json
{
  "mcpServers": {
    "cogniz-memory": {
      "url": "https://app.cogniz.online/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### Get Your API Key:
https://cogniz.online/dashboard → Settings → API Keys

---

## 🌐 For Web UIs (ChatGPT, Claude Web, etc.)

### Simple Copy-Paste URL:
```
https://app.cogniz.online/mcp?api_key=YOUR_API_KEY_HERE
```

### Where to Add:
1. **ChatGPT Web UI** → Settings → Connections → Add Custom Tool/MCP
2. **LibreChat** → Settings → Tools & Plugins → Add External Tool
3. **Open WebUI** → Settings → Connections → Add MCP Server

### Configuration Example:
- **Name:** Cogniz Memory Platform
- **URL:** `https://app.cogniz.online/mcp?api_key=YOUR_KEY`
- **Method:** POST
- **Type:** MCP Server

---

## 🧪 Quick Test

### Test 1: Check Server is Online
```bash
curl https://app.cogniz.online/health
```
**Expected:** `{"status":"healthy","service":"cogniz-mcp-server"}`

### Test 2: List Available Tools
```bash
curl "https://app.cogniz.online/mcp?api_key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
**Expected:** List of 5 tools (cogniz_store_memory, cogniz_search_memories, etc.)

### Test 3: Try in AI Assistant
Ask your AI: **"Store a memory: Test from [Platform Name]"**

---

## 🔑 API Key Format

Your API key should look like:
```
mp_1_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Get it from: https://cogniz.online/dashboard

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect" | Check API key is correct |
| "401 Unauthorized" | Get fresh key from dashboard |
| "Not available" | Web UI doesn't support MCP - use query param method |
| "Rate limit" | Upgrade plan or wait for monthly reset |

---

## 📊 Available Tools

1. **cogniz_store_memory** - Save new memory
2. **cogniz_search_memories** - Search existing memories
3. **cogniz_list_projects** - List all projects
4. **cogniz_get_stats** - View usage stats
5. **cogniz_delete_memory** - Delete specific memory

---

## 🔗 Important Links

- **Landing Page:** https://app.cogniz.online/
- **Dashboard:** https://cogniz.online/dashboard
- **Documentation:** https://cogniz.online/documentation
- **GitHub:** https://github.com/cognizonline/Cogniz_Claude_MCP
- **Detailed Web UI Guide:** See WEBUI_CONNECTOR_GUIDE.md

---

**Status:** ✅ SSL Active | ✅ Multi-Tenant | ✅ Production Ready
