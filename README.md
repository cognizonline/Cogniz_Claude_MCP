# Cogniz Memory Platform - MCP Server

**Enable Claude to interact with Cogniz Memory Platform through MCP (Model Context Protocol)**

This MCP server provides tools for storing, searching, and managing memories in the Cogniz Platform, enabling seamless integration with Claude Code, Claude Desktop, Claude Web UI, and other MCP-compatible clients.

## Two Deployment Modes

- **Local Mode** (stdio transport) - For Claude Code and Claude Desktop
- **Remote Mode** (HTTP/SSE transport) - For Claude Web UI (Pro/Max/Team/Enterprise)

---

## Features

✅ **Store Memories** - Save conversation context and important information
✅ **Search Memories** - Semantic search across all your memories
✅ **Delete Memories** - Remove unwanted entries
✅ **Get Statistics** - View usage stats and plan details
✅ **List Projects** - See all your projects with memory counts
✅ **Web UI Support** - Works in Claude.ai via Remote MCP
✅ **Desktop Support** - Works in Claude Code/Desktop via Local MCP

---

## Prerequisites

- **Node.js** 18+
- **Cogniz Platform Account** - Sign up at https://cogniz.online
- **API Key** - Get from Cogniz Platform settings

---

## Installation

### Option 1: Global Install (Recommended)

```bash
npm install -g cogniz-mcp-server
```

### Option 2: Local Development

```bash
git clone <repo>
cd cogniz-mcp-server
npm install
npm run build
```

---

## Configuration

Create `~/.cogniz/config.json`:

```json
{
  "api_key": "mp_1_YourAPIKeyHere",
  "base_url": "https://cogniz.online",
  "project_id": "default"
}
```

**Get your API key**:
1. Go to https://cogniz.online
2. Settings → API Keys
3. Create new key
4. Copy to config file

---

## Usage with Claude Code

### 1. Configure MCP in Claude Code

Edit `~/.claude/config.json` (or `%APPDATA%\.claude\config.json` on Windows):

```json
{
  "mcpServers": {
    "cogniz": {
      "command": "cogniz-mcp-server"
    }
  }
}
```

### 2. Restart Claude Code

```bash
# Claude Code will now have access to Cogniz tools
```

### 3. Use in Conversations

```
Claude, store this memory: "Project X uses React 18 with TypeScript"

Claude, search my memories for "React"

Claude, show me my Cogniz statistics
```

---

## Usage with Claude Web UI (Remote MCP)

**✅ Now Available!** Claude Web UI supports Remote MCP servers for Pro, Max, Team, and Enterprise plans.

### Quick Start

1. **Deploy the server** (see [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide)
   - Recommended: Use Render.com free tier
   - Or use Railway, Vercel, Heroku, Azure Functions

2. **Add to Claude Web UI**:
   - Go to [claude.ai](https://claude.ai)
   - Click profile icon → Settings
   - Select "Connectors" from sidebar
   - Click "Add custom connector" at bottom
   - Enter your server URL: `https://your-server.com/sse`

3. **Start using**:
   ```
   Claude, store this memory: "Testing Remote MCP!"
   Claude, show my Cogniz statistics
   ```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Available Tools

### `cogniz_store_memory`

Store a new memory in Cogniz Platform.

**Parameters**:
- `content` (required): The memory content
- `project_id` (optional): Project identifier
- `project_name` (optional): Human-readable project name
- `category` (optional): Category tag

**Example**:
```
Store this memory: "Database migration completed on 2025-10-20"
```

---

### `cogniz_search_memories`

Search for memories using semantic search.

**Parameters**:
- `query` (required): Search query text
- `project_id` (optional): Limit to specific project
- `limit` (optional): Max results (default: 10)

**Example**:
```
Search my memories for "database migration"
```

---

### `cogniz_delete_memory`

Delete a specific memory by ID.

**Parameters**:
- `memory_id` (required): The memory ID to delete

**Example**:
```
Delete memory with ID: local_abc123...
```

---

### `cogniz_get_stats`

Get user statistics and plan information.

**Returns**:
- Plan name
- Project count and limit
- Total memories
- Storage usage
- API calls this month
- Average compression ratio

**Example**:
```
Show me my Cogniz statistics
```

---

### `cogniz_list_projects`

List all projects with memory counts.

**Returns**:
- Project ID and name
- Memory count per project
- Last activity date

**Example**:
```
List all my Cogniz projects
```

---

## Architecture

```
Claude (any platform)
    ↓ (uses MCP tools)
MCP Server (local process)
    ↓ (calls REST API)
Cogniz Platform (https://cogniz.online)
    ↓ (stores in)
Database (MySQL)
```

---

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Run Locally

```bash
npm run dev
```

---

## Troubleshooting

### "Config file not found"

Create `~/.cogniz/config.json` with your API key:

```json
{
  "api_key": "your_key_here",
  "base_url": "https://cogniz.online"
}
```

### "API Error: 403 Forbidden"

- Check API key is valid
- Verify key has necessary permissions
- Ensure platform URL is correct

### "MCP server not found"

If globally installed:
```bash
which cogniz-mcp-server  # Should show path
```

If not found:
```bash
npm install -g cogniz-mcp-server
```

### Claude Code not seeing tools

1. Check `~/.claude/config.json` has correct MCP config
2. Restart Claude Code
3. Try: "List available MCP tools"

---

## Security

- **API keys stored locally** in `~/.cogniz/config.json`
- **Never commit config.json** to version control
- **Use environment-specific keys** for different environments
- **Rotate keys regularly** in Cogniz Platform settings

---

## Pricing

**MCP Server**: Free and open source

**Cogniz Platform Subscription** (required):
- **Starter**: $9/month (10 projects, 1GB storage)
- **Pro**: $19/month (unlimited projects, 10GB storage)
- **Enterprise**: $49/month (unlimited everything, priority support)

---

## Support

- **Documentation**: https://cogniz.online/docs
- **Issues**: https://github.com/yourusername/cogniz-mcp-server/issues
- **Email**: support@cogniz.online

---

## License

MIT License - See LICENSE file

---

## Credits

Built with:
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- Cogniz Memory Platform API

---

## Changelog

### v1.0.0 (2025-10-20)
- Initial release
- Core MCP tools: store, search, delete, stats, projects
- Configuration via ~/.cogniz/config.json
- Claude Code integration

---

**Ready to give Claude persistent memory? Install now!**

```bash
npm install -g cogniz-mcp-server
```
