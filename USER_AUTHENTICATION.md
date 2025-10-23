# User Authentication for Cogniz MCP Server

## Overview

The Cogniz MCP Server now supports **per-user authentication**. Each user provides their own Cogniz API key, ensuring they only access their own memories and account.

## How It Works

### Bearer Token Authentication
- Users provide their Cogniz API key when connecting the MCP server
- The API key is sent in the `Authorization` header as a Bearer token
- Each request uses the user's API key to authenticate with cogniz.online
- No shared accounts - every user has isolated memory access

## Setup for Users

### Step 1: Get Your Cogniz API Key

1. Go to https://cogniz.online
2. Sign in to your account
3. Navigate to **Settings** → **API Keys**
4. Copy your API key (format: `mp_1_xxxxxxxxxxxxxxxx`)

### Step 2: Connect to Claude Web UI

1. Open Claude (https://claude.ai)
2. Go to **Settings** → **Connectors**
3. Click **"Add Custom Connector"**
4. Fill in:
   - **Name**: Cogniz Memory Platform
   - **URL**: `https://cogniz-claude-mcp.onrender.com/mcp`
   - **API Key** (in Advanced settings): Paste your Cogniz API key

5. Click **"Connect"**

### Step 3: Use the Tools

Available tools in Claude:
- **Store Memory** - Save information to your account
- **Search Memories** - Find memories by query
- **List Projects** - See all your projects
- **Get Stats** - View your usage statistics
- **Get/Delete Memory** - Manage individual memories

## For ChatGPT Users

1. Go to ChatGPT → **Settings** → **Custom Connectors**
2. Add connector:
   - **Server URL**: `https://cogniz-claude-mcp.onrender.com/mcp`
   - **Authentication**: Bearer Token
   - **Token**: Your Cogniz API key (`mp_1_xxx...`)

## Security

✅ **Your API key is secure:**
- Transmitted only over HTTPS
- Never logged or stored by the MCP server
- Only used to authenticate YOUR requests to cogniz.online
- Each user's data is completely isolated

✅ **What the server does:**
- Receives your API key in Authorization header
- Uses it to make API calls on your behalf
- Returns your data only

✅ **What the server does NOT do:**
- Store your API key
- Share your data with other users
- Log sensitive information
- Access anyone else's account

## Troubleshooting

### "No API key provided" error
- Make sure you entered your API key in the connector settings
- Check that the key starts with `mp_1_`
- Verify the key is active at cogniz.online

### "Authentication failed" error
- Your API key may be invalid or expired
- Get a new key from cogniz.online settings
- Update the connector with the new key

### Seeing someone else's memories
- **This should NOT happen!** Each API key is tied to one account
- If you see this, contact support immediately
- Double-check you're using YOUR API key, not someone else's

## Technical Details

### API Key Flow
```
User → Claude/ChatGPT → MCP Server → cogniz.online
      [Bearer token]    [Extract]     [Use for auth]
```

### Request Headers
```http
POST /mcp HTTP/1.1
Host: cogniz-claude-mcp.onrender.com
Authorization: Bearer mp_1_YourCognizAPIKey
Content-Type: application/json
Accept: application/json, text/event-stream
```

### Environment Variables (For Server Hosting)

**Required:**
- `COGNIZ_BASE_URL` - API base URL (default: https://cogniz.online)

**Optional:**
- `COGNIZ_API_KEY` - Fallback API key for testing (not recommended for production)
- `COGNIZ_PROJECT_ID` - Default project ID (default: "default")

## Migration from Shared Key

**Old Setup (Single Account):**
- Everyone used the server owner's API key
- All users saw the same memories
- No data isolation

**New Setup (Per-User Authentication):**
- ✅ Each user uses their own API key
- ✅ Complete data isolation
- ✅ Each user sees only their memories
- ✅ Usage tracked per user

### Action Required

If you're currently using the server:
1. Get your own Cogniz API key from https://cogniz.online
2. Update your connector settings with YOUR API key
3. Test that you see your own memories

## For Server Administrators

### Deploy with User Authentication

1. **Remove hardcoded API key** from Render environment:
   - Go to Render dashboard
   - Remove or clear `COGNIZ_API_KEY` variable
   - This forces users to provide their own keys

2. **Deploy the updated server** with user authentication support

3. **Inform users** to update their connector settings with their personal API keys

### Monitoring

Check logs for:
```
User API key provided: mp_1_xxxxx...
```

This confirms users are authenticating with their own keys.

If you see:
```
No user API key - using fallback from environment
```

This means a user hasn't provided their key, or the old setup is still active.

## Future: Full OAuth Support

Currently, users provide API keys directly. Future versions may support:
- OAuth 2.1 flow
- Automatic token refresh
- Scoped permissions
- Better key management

For now, Bearer token authentication provides:
- ✅ Simple setup
- ✅ Secure transmission
- ✅ Per-user isolation
- ✅ Works with all AI platforms

## Support

- Cogniz Platform: https://cogniz.online
- MCP Server Issues: GitHub repository
- API Documentation: https://cogniz.online/api/docs
