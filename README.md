# Cogniz Memory Platform - MCP Server

Official **Model Context Protocol (MCP)** server for [Cogniz Memory Platform](https://cogniz.online) - Enables AI assistants like Claude to store and retrieve memories across conversations.

**🌐 Live Server:** `https://cogniz-claude-mcp.onrender.com/mcp`

---

## ✨ Features

- 🔌 **MCP Protocol 2025-03-26** - Latest streamable HTTP transport
- 🔐 **Multi-Tenant** - Each user uses their own API key
- 🧠 **Persistent Memory** - Store and retrieve context across sessions
- 🔍 **Semantic Search** - Find relevant memories using natural language
- 📁 **Project Organization** - Organize memories by project
- 💾 **Auto-Compression** - 65% storage savings with lossless compression
- 🌍 **Remote Access** - Works with Claude Desktop AND Web UIs

---

## 🚀 Quick Start

### For Claude Desktop Users

**1. Get Your API Key:**
- Visit [cogniz.online/dashboard](https://cogniz.online/dashboard)
- Navigate to **API Reference** section
- Copy your API key (format: `mp_1_XXXXXXXXXXXX`)

**2. Configure Claude Desktop:**

Open your Claude Desktop config file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "cogniz-memory": {
      "url": "https://cogniz-claude-mcp.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}
```

**Replace `YOUR_API_KEY_HERE` with your actual API key.**

**3. Restart Claude Desktop**

**4. Test It:**
```
You: "Store a memory: MCP integration is working!"
Claude: "I've stored that memory in your Cogniz account."
```

Verify it appears in your [dashboard](https://cogniz.online/dashboard).

---

### For Web UI Users (ChatGPT Web UI, Claude Web UI, etc.)

Web UIs often can't send custom headers, so we support **query parameter authentication**.

**Method 1: Custom Connector (if supported)**

Some Web UIs support custom connectors:

1. Go to **Settings → Connectors**
2. Add Custom Connector:
   - **Name:** Cogniz Memory Platform
   - **URL:** `https://cogniz-claude-mcp.onrender.com/mcp?api_key=YOUR_API_KEY`
   - **Method:** POST

**Method 2: URL with API Key**

Use this URL format:
```
https://cogniz-claude-mcp.onrender.com/mcp?api_key=YOUR_API_KEY
```

⚠️ **Security Note:** Query parameters are less secure than headers because they appear in logs and URLs. Use this method only for Web UIs that don't support Authorization headers.

---

## 🛠️ Available Tools

Once connected, Claude can use these MCP tools:

### `cogniz_store_memory`
Store a new memory in the Cogniz platform.

**Parameters:**
- `content` (required): The text/information to store
- `project_id` (optional): Project identifier (default: "default")
- `project_name` (optional): Human-readable project name
- `category` (optional): Category tag (e.g., "code-snippets", "meeting-notes")

**Example:**
```
"Store this code snippet in my development project: async function fetchData() { ... }"
```

---

### `cogniz_search_memories`
Search memories using semantic search.

**Parameters:**
- `query` (required): Search text
- `project_id` (optional): Limit search to specific project
- `limit` (optional): Max results (1-100, default: 10)

**Example:**
```
"Search my memories for API authentication examples"
```

---

### `cogniz_list_projects`
List all your projects.

**Example:**
```
"Show me all my projects"
```

---

### `cogniz_get_stats`
View your usage statistics.

**Returns:**
- Current plan
- Memory usage
- API calls
- Project count
- Storage stats

**Example:**
```
"How much memory am I using?"
```

---

### `cogniz_delete_memory`
Delete a specific memory by ID.

**Parameters:**
- `memory_id` (required): ID of memory to delete

**Example:**
```
"Delete memory mem_12345"
```

---

## 🔐 Authentication Methods

This server supports **two authentication methods** to work with different clients:

### Method 1: Authorization Header (Recommended)

**Best for:** Claude Desktop, API clients, secure environments

**Format:**
```http
POST /mcp HTTP/1.1
Authorization: Bearer mp_1_YOUR_API_KEY
Content-Type: application/json
```

**Pros:**
- ✅ More secure
- ✅ Not visible in URLs/logs
- ✅ Standard HTTP authentication

---

### Method 2: Query Parameter

**Best for:** Web UIs that can't send custom headers

**Format:**
```
https://cogniz-claude-mcp.onrender.com/mcp?api_key=mp_1_YOUR_API_KEY
```

**Pros:**
- ✅ Works with Web UIs
- ✅ No header support needed

**Cons:**
- ⚠️ Less secure (visible in URLs)
- ⚠️ Appears in server logs
- ⚠️ May be cached by proxies

---

## 📊 Pricing Plans

The MCP server is **free to use**. You only pay for your Cogniz Memory Platform account:

| Plan | Price | Memory Limit | Projects | API Calls/Month |
|------|-------|--------------|----------|-----------------|
| **Starter** | Free (30 days) | 100 MB | 3 | 1,000 |
| **Plus** | $7/month | Unlimited | 15 | 15,000 |
| **Pro** | $49/month | Unlimited | Unlimited | 100,000 |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited |

[View detailed pricing](https://cogniz.online/dashboard#pricing-comparison-section)

---

## 🧪 Testing

### Health Check

```bash
curl https://cogniz-claude-mcp.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "cogniz-mcp-server"
}
```

### Test Authentication (Header Method)

```bash
curl -X POST https://cogniz-claude-mcp.onrender.com/mcp \
  -H "Authorization: Bearer mp_1_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Test Authentication (Query Method)

```bash
curl -X POST "https://cogniz-claude-mcp.onrender.com/mcp?api_key=mp_1_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

**Expected:** List of 5 available MCP tools

---

## 🏗️ Self-Hosting

Want to run your own instance? Clone and deploy:

### Prerequisites

- Node.js 18+
- TypeScript
- Render account (or any Node.js hosting)

### Deploy to Render

**1. Fork this repository**

**2. Create Web Service on Render:**
- Connect your GitHub fork
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment Variables:
  - `COGNIZ_BASE_URL=https://cogniz.online`
  - `COGNIZ_PROJECT_ID=default`
  - Optional: `COGNIZ_API_KEY` (for demo/testing only)

**3. Configure Custom Domain (Optional):**
- Professional plan required ($19/month)
- Add CNAME: `your-subdomain.com` → `your-service.onrender.com`
- SSL auto-configured

**4. Update OAuth Discovery URL:**
In `src/server-remote.ts` line 224:
```typescript
resource: "https://your-domain.com/mcp",
```

**5. Deploy and test!**

---

## 📚 Documentation

- **MCP Protocol:** https://modelcontextprotocol.io
- **Cogniz Platform:** https://cogniz.online/documentation
- **API Reference:** https://cogniz.online/dashboard#api-reference
- **Support:** https://cogniz.online/contact

---

## 🔧 Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/cognizonline/Cogniz_Claude_MCP.git
cd Cogniz_Claude_MCP

# Install dependencies
npm install

# Build TypeScript
npm run build

# Set environment variables
export COGNIZ_BASE_URL=https://cogniz.online
export COGNIZ_API_KEY=mp_1_YOUR_TEST_KEY

# Start server
npm start

# Server runs on http://localhost:3000
```

### Test Locally

```bash
# Health check
curl http://localhost:3000/health

# List tools
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer mp_1_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📋 Troubleshooting

### "Authentication required" error

**Cause:** No API key provided

**Fix:**
- Desktop: Add `Authorization: Bearer YOUR_KEY` to config
- Web UI: Add `?api_key=YOUR_KEY` to URL

### "Invalid API key" (401 error)

**Cause:** API key is wrong or expired

**Fix:**
- Get fresh API key from [dashboard](https://cogniz.online/dashboard)
- Verify format: `mp_1_XXXXXXXXXXXX`

### "Rate limit exceeded" (429 error)

**Cause:** Exceeded monthly API call limit

**Fix:**
- Check usage in dashboard
- Upgrade plan for more calls
- Limit resets monthly

### Connection timeout

**Cause:** Server on free Render plan (cold starts)

**Fix:**
- Wait 30-60 seconds for warmup
- Or upgrade to Professional plan ($19/month) for always-on

---

## 💰 Hosting Costs

### Free Render Plan
- ✅ Free forever
- ⚠️ Cold starts (30-60s delay after 15min idle)
- ⚠️ Limited resources

### Professional Render Plan ($19/month)
- ✅ Always-on (no cold starts)
- ✅ Better performance
- ✅ Custom domains
- ✅ Priority support

**Recommended for production use.**

---

## 🔒 Security

### API Key Safety

- ✅ Keys transmitted via HTTPS only
- ✅ Server doesn't store keys (stateless)
- ✅ Each request isolated
- ✅ SSL/TLS encryption

### Best Practices

1. **Never commit API keys to git**
2. **Use Authorization header when possible** (more secure than query params)
3. **Rotate keys periodically**
4. **Monitor usage** for suspicious activity
5. **Use query params only for Web UIs** that don't support headers

---

## 🌐 Protocol Details

### MCP Version
`2025-03-26` (Streamable HTTP)

### Transport
HTTP POST with streaming support

### Endpoints
- `POST /mcp` - Main MCP endpoint
- `GET /health` - Health check
- `GET /.well-known/oauth-protected-resource` - Auth discovery

### Supported Methods
- `tools/list` - List available tools
- `tools/call` - Execute a tool
- `resources/list` - List resources (future)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/cognizonline/Cogniz_Claude_MCP/issues)
- **Email:** support@cogniz.online
- **Documentation:** [cogniz.online/documentation](https://cogniz.online/documentation)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Built on [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- Powered by [Cogniz Memory Platform](https://cogniz.online)
- TypeScript + Express + MCP SDK

---

## 🔄 Changelog

### v1.2.0 (Latest - January 2025)
- ✅ Multi-tenant support with user-provided API keys
- ✅ Authorization header authentication (recommended)
- ✅ Query parameter authentication (for Web UIs)
- ✅ Improved error messages
- ✅ OAuth discovery metadata

### v1.1.0 (October 2024)
- ✅ Updated to MCP Streamable HTTP protocol (2025-03-26)
- ✅ Fixed API field mappings
- ✅ Improved error handling

### v1.0.0
- Initial release
- Basic MCP tools
- Streamable HTTP transport

---

**Live MCP Server:** https://cogniz-claude-mcp.onrender.com/mcp

**Get Your API Key:** https://cogniz.online/dashboard

**Need Help?** Open an issue or contact support@cogniz.online

---

Made with ❤️ for the AI community
