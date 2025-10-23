# Cogniz Memory Platform - MCP Server

**Connect Claude AI to your Cogniz Memory Platform account via Model Context Protocol (MCP)**

This MCP server enables Claude (Desktop, Code, or Web UI) to store, search, and manage memories in your Cogniz Platform account, providing persistent context across conversations.

---

## Features

✅ **Store Memories** - Save conversation context and important information
✅ **Search Memories** - Semantic search across all your memories
✅ **Delete Memories** - Remove unwanted entries
✅ **Get Statistics** - View usage stats and plan details
✅ **List Projects** - See all your projects with memory counts
✅ **Multiple Deployment Options** - Local, Remote, or VS Code

---

## Prerequisites

- **Node.js** 18 or higher
- **Cogniz Platform Account** - Sign up at [cogniz.online](https://cogniz.online)
- **API Key** - Get from Cogniz Platform Settings → API Keys

---

## Quick Start

### Get Your API Key

1. Go to [cogniz.online](https://cogniz.online)
2. Login → Settings → API Keys
3. Create new key (format: `mp_1_xxxxxxxxxxxxx`)
4. Copy the key for installation

---

## Installation Options

### Option 1: VS Code MCP Extension (Easiest)

**For VS Code Claude Extension:**

1. Install the Claude extension in VS Code
2. Open VS Code Settings (JSON)
3. Add to your `settings.json`:

```json
{
  "mcpServers": {
    "cogniz": {
      "command": "npx",
      "args": ["-y", "@cogniz/mcp-server"],
      "env": {
        "COGNIZ_API_KEY": "mp_1_your_key_here",
        "COGNIZ_BASE_URL": "https://cogniz.online",
        "COGNIZ_PROJECT_ID": "default"
      }
    }
  }
}
```

4. Reload VS Code
5. Claude now has access to your Cogniz memories!

---

### Option 2: Claude Desktop (Local MCP)

**For Claude Desktop App:**

1. Create config file:
   - **macOS/Linux**: `~/.claude/config.json`
   - **Windows**: `%APPDATA%\.claude\config.json`

2. Add this configuration:

```json
{
  "mcpServers": {
    "cogniz": {
      "command": "npx",
      "args": ["-y", "@cogniz/mcp-server"],
      "env": {
        "COGNIZ_API_KEY": "mp_1_your_key_here",
        "COGNIZ_BASE_URL": "https://cogniz.online",
        "COGNIZ_PROJECT_ID": "default"
      }
    }
  }
}
```

3. Restart Claude Desktop
4. Start using memory tools in conversations!

---

### Option 3: Deploy Your Own Remote Server

**For Claude Web UI, ChatGPT, or sharing with a team:**

#### Deploy to Render.com (Free)

1. **Fork the repository:**
   ```
   https://github.com/cognizonline/Cogniz_Claude_MCP
   ```

2. **Sign up at [render.com](https://render.com)**

3. **Create New Web Service:**
   - Connect your forked GitHub repository
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:remote`

4. **Add Environment Variables:**
   ```
   COGNIZ_API_KEY = mp_1_your_key_here
   COGNIZ_BASE_URL = https://cogniz.online
   COGNIZ_PROJECT_ID = default
   ```

5. **Deploy and get your URL:**
   ```
   https://your-service-name.onrender.com/mcp
   ```

6. **Add to Claude Web UI:**
   - Claude.ai → Settings → Connectors
   - Add custom connector
   - Enter your server URL

#### Deploy to Other Platforms

**Railway:**
```bash
git clone https://github.com/cognizonline/Cogniz_Claude_MCP
cd cogniz-mcp-server
railway up
railway env set COGNIZ_API_KEY=mp_1_your_key
```

**Vercel:**
```bash
vercel deploy
vercel env add COGNIZ_API_KEY
```

**Self-Hosted:**
```bash
git clone https://github.com/cognizonline/Cogniz_Claude_MCP
cd cogniz-mcp-server
npm install
npm run build

export COGNIZ_API_KEY=mp_1_your_key
export COGNIZ_BASE_URL=https://cogniz.online
npm run start:remote
```

Server runs on port 3000 by default. Access at `http://localhost:3000/mcp`

---

## Available Tools

Once installed, Claude can use these tools:

### 1. **cogniz_store_memory**
Save information to your Cogniz account.

**Parameters:**
- `content` (required) - The memory content to store
- `project_id` (optional) - Project identifier
- `project_name` (optional) - Human-readable project name
- `category` (optional) - Category tag for organization

**Example:**
```
Claude, store this memory: "Project Phoenix uses React 18 with TypeScript and PostgreSQL"
```

---

### 2. **cogniz_search_memories**
Search your memories using semantic search.

**Parameters:**
- `query` (required) - Search query text
- `project_id` (optional) - Limit to specific project
- `limit` (optional) - Max results (default: 10)
- `format` (optional) - "markdown" or "json" (default: "markdown")

**Example:**
```
Claude, search my memories for "React and PostgreSQL"
```

---

### 3. **cogniz_get_memory**
Retrieve a specific memory by ID.

**Parameters:**
- `memory_id` (required) - The memory ID to retrieve

**Example:**
```
Claude, get memory with ID: local_abc123xyz
```

---

### 4. **cogniz_delete_memory**
Delete a specific memory.

**Parameters:**
- `memory_id` (required) - The memory ID to delete

**Example:**
```
Claude, delete memory with ID: local_abc123xyz
```

---

### 5. **cogniz_get_stats**
View your account statistics.

**Returns:**
- Plan name and status
- Project count and limits
- Total memories stored
- Storage usage
- API calls this month
- Average compression ratio
- Next billing date

**Example:**
```
Claude, show me my Cogniz statistics
```

---

### 6. **cogniz_list_projects**
List all your projects with details.

**Parameters:**
- `format` (optional) - "markdown" or "json" (default: "markdown")

**Returns:**
- Project ID and name
- Memory count per project
- Storage size
- Compression ratio
- Last accessed date

**Example:**
```
Claude, list all my Cogniz projects
```

---

## Usage Examples

### Storing Memories

```
Claude, store this information: "Our API uses JWT tokens with 1-hour expiration"

Claude, save this to my 'backend-project': "Database credentials are in AWS Secrets Manager"
```

### Searching Memories

```
Claude, search my memories for "JWT tokens"

Claude, find all memories about "database" in my backend-project
```

### Managing Memories

```
Claude, show my Cogniz statistics

Claude, list my projects

Claude, delete memory with ID: local_abc123xyz
```

---

## Architecture

```
Claude (Desktop/Code/Web)
    ↓ MCP Protocol
MCP Server (This package)
    ↓ HTTPS REST API
Cogniz Platform (cogniz.online)
    ↓ Stores in
Database (MySQL with AI compression)
```

---

## Security

✅ **Your API key is secure:**
- Stored only in your local config or deployment environment
- Transmitted only over HTTPS
- Never logged or stored by the MCP server
- Each user's data is completely isolated

✅ **Best Practices:**
- Never commit API keys to version control
- Use environment variables for deployment
- Rotate keys regularly in Cogniz Platform settings
- Each user should deploy their own server for privacy

---

## Important: Per-User Authentication

**Current Limitation:**

As of October 2025, Claude Web UI and ChatGPT **do not support per-user authentication** for MCP servers. This means:

- ❌ You cannot provide your API key when connecting to a shared server
- ✅ You must deploy your own server with YOUR API key

**Solution:**

Each user should deploy their own MCP server instance (see "Option 3: Deploy Your Own Remote Server" above). This ensures:
- ✅ Your API key stays in YOUR deployment
- ✅ Your data is completely private
- ✅ No shared accounts

**Future:**

The server code is ready for per-user authentication! When Claude/ChatGPT add support for custom Bearer tokens, users will be able to:
- Connect to a shared server
- Provide their own API key
- Access only their own memories

See `FINAL_SOLUTION.md` for technical details.

---

## Development

### Build from Source

```bash
git clone https://github.com/cognizonline/Cogniz_Claude_MCP
cd cogniz-mcp-server
npm install
npm run build
```

### Run Locally

```bash
# For testing Remote MCP
export COGNIZ_API_KEY=mp_1_your_key
npm run start:remote

# For testing Local MCP (stdio)
node dist/index.js
```

### Project Structure

```
cogniz-mcp-server/
├── src/
│   ├── index.ts           # Local MCP server (stdio)
│   └── server-remote.ts   # Remote MCP server (HTTP/SSE)
├── package.json
├── tsconfig.json
├── render.yaml           # Render.com deployment config
└── README.md
```

---

## Troubleshooting

### "No API key provided"
- Check environment variable `COGNIZ_API_KEY` is set
- Verify API key format: `mp_1_xxxxxxxxxxxxx`
- Ensure key is active at cogniz.online

### "Authentication failed"
- API key may be invalid or expired
- Get a new key from cogniz.online Settings → API Keys
- Update your configuration

### "Connection refused" (Remote deployment)
- Check server is running on correct port
- Verify environment variables are set
- Check server logs for errors

### VS Code/Desktop not seeing tools
1. Check config file location:
   - VS Code: `.vscode/settings.json`
   - Desktop: `~/.claude/config.json` (or `%APPDATA%\.claude\config.json`)
2. Verify API key is correct
3. Restart application
4. Check logs for errors

### Bot Protection Blocking
If you see "Access denied by Imunify360 bot-protection":
- This affects some hosting providers
- Solution: Deploy your own server instance
- Your own deployment won't be blocked

---

## Pricing

**MCP Server:** Free and open source (MIT License)

**Cogniz Platform Subscription** (required):
- **Starter**: $9/month - 10 projects, 1GB storage
- **Pro**: $19/month - Unlimited projects, 10GB storage
- **Enterprise**: $49/month - Unlimited everything, priority support

Learn more at [cogniz.online/pricing](https://cogniz.online/pricing)

---

## Support

- **Platform Documentation**: [cogniz.online/docs](https://cogniz.online/docs)
- **MCP Issues**: [GitHub Issues](https://github.com/cognizonline/Cogniz_Claude_MCP/issues)
- **Email Support**: support@cogniz.online

---

## License

MIT License - See LICENSE file for details

---

## Credits

Built with:
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) - Official MCP SDK
- [Cogniz Memory Platform](https://cogniz.online) - AI-powered memory compression and storage

---

## Changelog

### v1.1.0 (2025-10-23)
- ✅ Updated to MCP Streamable HTTP protocol (2025-03-26)
- ✅ Fixed API field mappings for search, projects, and stats
- ✅ Added OAuth discovery endpoints for future authentication
- ✅ Improved error handling and logging
- ✅ Ready for per-user authentication when platforms support it

### v1.0.0 (2025-10-20)
- Initial release
- Core MCP tools: store, search, delete, stats, projects
- Local and Remote MCP support
- Claude Code, Desktop, and Web UI integration

---

**Ready to give Claude persistent memory? Get started now!**

```bash
# Quick start for VS Code
npm install -g @cogniz/mcp-server

# Or deploy your own server
git clone https://github.com/cognizonline/Cogniz_Claude_MCP
```

Visit [cogniz.online](https://cogniz.online) to create your account and get your API key.
