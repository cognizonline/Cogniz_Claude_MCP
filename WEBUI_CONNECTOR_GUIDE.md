# 🌐 Web UI Connector Guide - Cogniz MCP Server

**Live MCP Server:** https://app.cogniz.online/mcp

---

## 📋 Quick Setup Summary

### **For Claude Desktop Users:**
Update your config file location:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

### **For Web UI Users:**
Use this URL format:
```
https://app.cogniz.online/mcp?api_key=YOUR_API_KEY_HERE
```

---

## 1️⃣ **Claude Desktop Setup**

### Step 1: Open Config File

**Windows:**
```powershell
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**macOS/Linux:**
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Step 2: Add This Configuration

```json
{
  "mcpServers": {
    "cogniz-memory": {
      "url": "https://app.cogniz.online/mcp",
      "headers": {
        "Authorization": "Bearer mp_1_YOUR_API_KEY_HERE"
      }
    }
  }
}
```

**Replace `mp_1_YOUR_API_KEY_HERE`** with your actual API key from https://cogniz.online/dashboard

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop completely. You should see the 🔌 icon indicating MCP is connected.

### Step 4: Test It

In Claude Desktop, try:
```
Store a memory: Testing my Cogniz MCP integration!
```

Claude should respond that it stored the memory successfully.

---

## 2️⃣ **ChatGPT Web UI (Open WebUI, LibreChat, etc.)**

### For Open WebUI:

1. **Go to Settings** → **Connections** → **OpenAI API**

2. **Add Custom MCP Server:**
   - Click "Add Connection" or similar
   - **Type:** Custom MCP/Tool Server
   - **URL:** `https://app.cogniz.online/mcp?api_key=mp_1_YOUR_API_KEY`
   - **Method:** POST
   - **Name:** Cogniz Memory Platform

3. **Save** and restart the UI

4. **Test:**
   Ask ChatGPT: "Can you store a memory for me: Test from ChatGPT Web UI"

---

### For LibreChat:

1. **Open Settings** → **Tools & Plugins**

2. **Add External Tool:**
   ```json
   {
     "name": "cogniz_memory",
     "endpoint": "https://app.cogniz.online/mcp?api_key=mp_1_YOUR_API_KEY",
     "method": "POST",
     "headers": {
       "Content-Type": "application/json"
     }
   }
   ```

3. **Enable** the Cogniz Memory tool

4. **Test** by asking to store a memory

---

### For Custom ChatGPT Web UIs:

If your Web UI supports MCP/tool connectors:

1. **Navigate to:** Settings → Connectors or Tools

2. **Add New Connector:**
   - **Name:** Cogniz Memory Platform
   - **Type:** MCP Server
   - **URL:** `https://app.cogniz.online/mcp?api_key=mp_1_YOUR_API_KEY`
   - **Protocol:** POST
   - **Authentication:** None (key is in URL)

3. **Save** and enable

---

## 3️⃣ **Claude Web UI / Anthropic Console**

### Method 1: Using Browser Extension (If Available)

Some browser extensions allow adding MCP servers to Claude Web UI:

1. **Install MCP Browser Extension** (if available)
2. **Add Server:**
   - URL: `https://app.cogniz.online/mcp?api_key=mp_1_YOUR_API_KEY`
   - Method: POST
3. **Refresh** Claude Web UI

### Method 2: Direct API Integration

If your organization has API access to Claude:

```python
import anthropic

client = anthropic.Anthropic(
    api_key="your_anthropic_api_key"
)

# Configure MCP tools
mcp_config = {
    "tools": [{
        "name": "cogniz_memory",
        "mcp_server": "https://app.cogniz.online/mcp?api_key=mp_1_YOUR_API_KEY"
    }]
}

# Use in API calls
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=mcp_config["tools"],
    messages=[{"role": "user", "content": "Store a memory: Test"}]
)
```

### Method 3: Via Custom Connector (Some Enterprise Claude Deployments)

If you have enterprise Claude with custom connector support:

1. **Admin Console** → **Connectors**
2. **Add MCP Server:**
   - **URL:** `https://app.cogniz.online/mcp?api_key=mp_1_YOUR_API_KEY`
   - **Type:** Model Context Protocol
   - **Auth:** Query Parameter (pre-configured in URL)

---

## 4️⃣ **Testing Your Connection**

### Quick Test Commands:

**1. Store a Memory:**
```
Store this memory: MCP integration is working perfectly!
```

**2. Search Memories:**
```
Search my memories for "MCP integration"
```

**3. Get Stats:**
```
How much memory am I using in Cogniz?
```

**4. List Projects:**
```
Show me all my Cogniz projects
```

### Expected Responses:

✅ **Success:** AI responds with confirmation of action
❌ **Failure:** "I don't have access to that tool" or similar

---

## 5️⃣ **Security Notes**

### ⚠️ **About Query Parameter Authentication:**

**Why we use it for Web UIs:**
- Many Web UIs don't support custom headers
- Query parameter is the only option for these platforms

**Security considerations:**
- ⚠️ API key visible in URL (less secure than headers)
- ⚠️ May appear in server logs
- ⚠️ Could be cached by proxies

**Best Practices:**
1. ✅ Use Authorization header method when possible (Claude Desktop)
2. ✅ Only use query parameter for Web UIs that don't support headers
3. ✅ Rotate your API keys periodically
4. ✅ Monitor usage in your Cogniz dashboard
5. ❌ Never share URLs with embedded API keys publicly

---

## 6️⃣ **Troubleshooting**

### "Connection Failed" or "Cannot reach server"

**Check:**
1. Is your API key correct? Get it from https://cogniz.online/dashboard
2. Is the URL exactly: `https://app.cogniz.online/mcp?api_key=YOUR_KEY`
3. Did you replace `YOUR_KEY` with your actual key?

**Test manually:**
```bash
curl "https://app.cogniz.online/mcp?api_key=mp_1_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Should return list of 5 tools.

### "Authentication Error" or "401 Unauthorized"

**Cause:** Invalid or missing API key

**Fix:**
1. Copy fresh API key from dashboard
2. Verify format: `mp_1_XXXXXXXXXXXX`
3. Ensure no extra spaces or quotes in URL

### "Rate Limit Exceeded" (429 Error)

**Cause:** Exceeded monthly API call limit

**Fix:**
- Check usage in https://cogniz.online/dashboard
- Upgrade plan for more calls
- Limit resets monthly

---

## 7️⃣ **Available MCP Tools**

Once connected, these tools are available:

### `cogniz_store_memory`
**Purpose:** Save new memory
**Example:** "Store this code snippet in my development project"

### `cogniz_search_memories`
**Purpose:** Search across all memories
**Example:** "Search my memories for API authentication examples"

### `cogniz_list_projects`
**Purpose:** List all projects
**Example:** "Show me all my projects"

### `cogniz_get_stats`
**Purpose:** View usage statistics
**Example:** "How much memory am I using?"

### `cogniz_delete_memory`
**Purpose:** Delete specific memory
**Example:** "Delete memory mem_12345"

---

## 8️⃣ **API Key Management**

### Where to Get Your API Key:

1. Visit https://cogniz.online/dashboard
2. Scroll to **Settings** section
3. Look for **API Keys Management**
4. Click **Create New Key** if needed
5. Copy the key (format: `mp_1_XXXXXXXXXXXX`)

### Creating Multiple Keys:

You can create separate API keys for:
- Claude Desktop
- ChatGPT Web UI
- Development/testing
- Different projects

This allows you to:
- Track usage per platform
- Revoke specific keys without affecting others
- Monitor which platforms are using the most API calls

---

## 9️⃣ **Pricing & Limits**

The MCP server itself is **free to use**. You only pay for your Cogniz Memory Platform account:

| Plan | Price | API Calls/Month | Projects |
|------|-------|-----------------|----------|
| **Starter** | Free (30 days) | 1,000 | 3 |
| **Plus** | $7/month | 15,000 | 15 |
| **Pro** | $49/month | 100,000 | Unlimited |
| **Enterprise** | Custom | Unlimited | Unlimited |

Check your current usage: https://cogniz.online/dashboard

---

## 🔗 **Useful Links**

- **Dashboard:** https://cogniz.online/dashboard
- **Documentation:** https://cogniz.online/documentation
- **MCP Server Status:** https://app.cogniz.online/
- **GitHub:** https://github.com/cognizonline/Cogniz_Claude_MCP
- **Support:** support@cogniz.online

---

## 💡 **Need Help?**

1. **Check server status:** https://app.cogniz.online/health
2. **Test your API key:** https://cogniz.online/dashboard
3. **View documentation:** Click link above
4. **Contact support:** support@cogniz.online
5. **Open GitHub issue:** https://github.com/cognizonline/Cogniz_Claude_MCP/issues

---

**Last Updated:** 2025-01-31
**MCP Server Version:** 1.2.0
**Protocol:** 2025-03-26 (Streamable HTTP)
