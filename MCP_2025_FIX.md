# MCP 2025 Streamable HTTP Fix

## Problem Identified

The server was using the **OLD** MCP protocol (pre-March 2025):
- ❌ GET endpoint at `/sse`
- ❌ SSE-only transport
- ❌ No POST support
- ❌ Incompatible with Claude Web UI (March 2025+)

## Root Cause

MCP protocol changed in **March 2025** from HTTP+SSE to **Streamable HTTP**:

### Old Protocol (2024-11-05) - DEPRECATED
```
GET /sse → Opens SSE stream
Separate endpoint for requests
```

### New Protocol (2025-03-26) - CURRENT
```
POST /mcp → Single endpoint
Accept: application/json, text/event-stream
Returns either JSON or SSE based on request
```

## Solution Applied

### Changed Endpoint

**Before:**
```typescript
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/sse", res);
  await server.connect(transport);
});
```

**After:**
```typescript
app.post("/mcp", async (req, res) => {
  const acceptsSSE = req.headers['accept']?.includes('text/event-stream');
  const transport = new SSEServerTransport("/mcp", res);
  await server.connect(transport);
});
```

### Key Changes

1. **POST instead of GET** - New spec requires POST
2. **Endpoint changed** from `/sse` to `/mcp`
3. **Accept header checking** - Supports both JSON and SSE responses
4. **Backward compatibility** - Old `/sse` endpoint redirects to `/mcp`

## New URLs

### For Claude Web UI
```
https://cogniz-mcp.onrender.com/mcp
```

**NOT** `https://cogniz-mcp.onrender.com/sse` (old)

### Testing

```bash
# Health check (unchanged)
curl https://cogniz-mcp.onrender.com/health

# New MCP endpoint
curl -X POST https://cogniz-mcp.onrender.com/mcp \
  -H "Accept: application/json, text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

## References

- [Why MCP Deprecated SSE](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)
- [MCP Streamable HTTP Spec](https://spec.modelcontextprotocol.io/specification/2025-03-26/basic/transports/)
- [Cloudflare Blog on Streamable HTTP](https://blog.cloudflare.com/streamable-http-mcp-servers-python/)

## Action Required

After deploying this fix:

1. **Update Claude Web UI connector** to use:
   ```
   https://cogniz-mcp.onrender.com/mcp
   ```

2. **Remove old connector** (if using `/sse` endpoint)

3. **Test connection** - should now show "connected" status

## Why This Fixes the Issue

Claude Web UI (as of March 2025+) only supports the new Streamable HTTP protocol. The old SSE-only transport causes:
- Connection attempts (you saw "New SSE connection" logs)
- But handshake fails (wrong protocol)
- Connector shows "disconnected"

Now with correct protocol:
- ✅ POST to `/mcp` endpoint
- ✅ Proper Accept headers
- ✅ Streamable HTTP compatible
- ✅ Claude Web UI can connect
