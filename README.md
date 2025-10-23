# Cogniz Memory Platform - MCP Server

Connect Claude AI to your Cogniz Memory Platform account via Model Context Protocol (MCP).

## Quick Start

### 1. Get Your API Key

1. Sign up at [cogniz.online](https://cogniz.online)
2. Go to Settings → API Keys
3. Create new key (format: `mp_1_xxxxxxxxxxxxx`)

### 2. Choose Installation Method

#### Option A: VS Code (Easiest)

Add to VS Code `settings.json`:

```json
{
  "mcpServers": {
    "cogniz": {
      "command": "npx",
      "args": ["-y", "@cogniz/mcp-server"],
      "env": {
        "COGNIZ_API_KEY": "mp_1_your_key_here",
        "COGNIZ_BASE_URL": "https://cogniz.online"
      }
    }
  }
}
```

#### Option B: Claude Desktop

Add to `~/.claude/config.json` (Windows: `%APPDATA%\.claude\config.json`):

```json
{
  "mcpServers": {
    "cogniz": {
      "command": "npx",
      "args": ["-y", "@cogniz/mcp-server"],
      "env": {
        "COGNIZ_API_KEY": "mp_1_your_key_here",
        "COGNIZ_BASE_URL": "https://cogniz.online"
      }
    }
  }
}
```

#### Option C: Deploy Remote Server

**Render.com:**

1. Fork this repo
2. Create Web Service on [render.com](https://render.com)
3. Set environment variables:
   ```
   COGNIZ_API_KEY = mp_1_your_key_here
   COGNIZ_BASE_URL = https://cogniz.online
   ```
4. Deploy URL: `https://your-service.onrender.com/mcp`

**Self-Hosted:**

```bash
git clone https://github.com/cognizonline/Cogniz_Claude_MCP
cd cogniz-mcp-clean
npm install
npm run build

export COGNIZ_API_KEY=mp_1_your_key
npm run start:remote
```

## Available Tools

### cogniz_store_memory
Save information to your account.

```
Claude, store this: "API uses JWT tokens with 1-hour expiration"
```

### cogniz_search_memories
Search your memories.

```
Claude, search my memories for "JWT"
```

### cogniz_get_memory
Retrieve specific memory by ID.

### cogniz_delete_memory
Delete a memory by ID.

### cogniz_get_stats
View account statistics.

```
Claude, show my Cogniz statistics
```

### cogniz_list_projects
List all projects.

```
Claude, list my projects
```

## Security

- API keys stored locally or in your deployment
- All communication over HTTPS
- Deploy your own server for complete privacy

## Pricing

- **MCP Server**: Free (MIT License)
- **Cogniz Platform**: Starting at $9/month
  - Visit [cogniz.online/pricing](https://cogniz.online/pricing)

## Support

- Documentation: [cogniz.online/docs](https://cogniz.online/docs)
- Issues: [GitHub Issues](https://github.com/cognizonline/Cogniz_Claude_MCP/issues)
- Email: support@cogniz.online

## License

MIT License
