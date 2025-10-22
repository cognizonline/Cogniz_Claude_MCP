# Hosting Support Request - Whitelist Render IPs

## Issue Summary
Imunify360 is blocking legitimate API requests from Render.com deployment to WordPress REST API endpoints.

## Current Error
```
Access denied by Imunify360 bot-protection. IPs used for automation should be whitelisted
```

## What's Happening
- MCP server deployed on Render.com (https://cogniz-claude-mcp.onrender.com)
- Making authenticated API calls to: https://cogniz.online/wp-json/memory/v1/*
- All requests include proper Bearer token authentication
- Imunify360 is blocking these as "bot traffic"
- HTTP 200 response but returns access denied message

## Support Request Template

---

**Subject:** Whitelist Render.com IP addresses in Imunify360 for API access

**Message:**

Hello,

I need to whitelist IP addresses from Render.com in Imunify360 to allow API access to my WordPress site.

**Current Issue:**
- Requests to https://cogniz.online/wp-json/memory/v1/* are being blocked
- Error: "Access denied by Imunify360 bot-protection"
- These are legitimate authenticated API requests using Bearer token authentication

**What I Need:**

Please whitelist the following for my domain **cogniz.online**:

1. **Whitelist ALL Render.com outbound IP addresses** for API endpoint:
   - Path: `/wp-json/memory/v1/*`
   - OR disable Imunify360 bot protection for this specific API path

2. **Render.com uses these IP ranges** (they may rotate):
   - Oregon region IPs (my deployment region)
   - Please whitelist the entire Render IP pool if possible
   - Common Render IPs: 216.24.57.0/24, 216.24.58.0/24 (check Render docs for full list)

**Alternative Solution:**

If whitelisting specific IPs is difficult, please disable Imunify360 bot-protection rules for requests that include:
- Authorization header with "Bearer" token
- To path: `/wp-json/memory/v1/*`

This is a legitimate API integration and the requests are properly authenticated.

Thank you!

---

## Technical Details (For Support)

**Domain:** cogniz.online

**Path to Whitelist:** `/wp-json/memory/v1/*`

**Request Characteristics:**
- Method: GET, POST, DELETE
- Headers: `Authorization: Bearer [token]`, `Content-Type: application/json`
- User-Agent: `Cogniz-MCP-Server/1.0 (Model Context Protocol)`

**Service Provider:** Render.com (Cloud hosting platform)

**Deployment Region:** Oregon, USA

**Why This is Safe:**
- Requests are authenticated with API key
- Only accessing custom API endpoints (not admin areas)
- Legitimate business API integration for Model Context Protocol server
- Read-only stats endpoint and memory database operations

## Render IP Addresses

Render uses dynamic IP addresses that may rotate. Common IP ranges:

**Oregon Region (us-west):**
- 216.24.57.0/24
- 216.24.58.0/24
- 216.24.59.0/24

**Recommendation:** Whitelist the entire `/wp-json/memory/v1/` path for any IP with valid Bearer token authentication.

## Testing After Whitelist

Once whitelisting is complete, test with:

```bash
curl -X GET "https://cogniz.online/wp-json/memory/v1/user-stats" \
  -H "Authorization: Bearer mp_1_PhVJHnsiWuV7H6x81SnM0n3KCPVobFse" \
  -H "User-Agent: Cogniz-MCP-Server/1.0"
```

Expected response: JSON with plan details, projects count, memory stats (NOT "Access denied by Imunify360")

## Alternative: Temporary Solution

If hosting provider cannot whitelist quickly, consider:

1. **Deploy to different hosting** - Use Cloudflare Workers or AWS Lambda (no Imunify360)
2. **Disable Imunify360** - If you have full server access (not recommended for security)
3. **Use VPS without bot protection** - Deploy WordPress API on separate server
4. **Contact Render support** - Ask for static IP option (usually paid feature)

## Status

- [x] Issue identified: Imunify360 blocking
- [x] User-Agent header added (didn't help)
- [ ] Hosting support contacted
- [ ] IP whitelist applied
- [ ] Testing successful
