# Streamable HTTP Fix - FINAL SOLUTION

## Problem Root Cause

The server was using **`SSEServerTransport`** which is designed for the OLD MCP protocol (HTTP+SSE, deprecated in 2024-11-05).

Even though we changed the endpoint from GET /sse to POST /mcp, the underlying transport class was still wrong.

## The Wrong Code

```typescript
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

app.post("/mcp", async (req, res) => {
  const transport = new SSEServerTransport("/mcp", res);
  await server.connect(transport);
});
```

**Why this failed:**
- `SSEServerTransport` sends `event: endpoint` as first response
- Expects client to connect to a separate session URL
- This is the OLD two-endpoint architecture
- Claude Web UI doesn't support this anymore

## The Correct Code

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,  // Stateless mode
    enableJsonResponse: true        // Support both JSON and SSE
  });

  res.on('close', () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
```

**Why this works:**
- `StreamableHTTPServerTransport` implements MCP 2025-03-26 protocol
- Single endpoint for all communication
- Handles JSON-RPC messages directly in POST body
- Can stream responses via SSE when needed
- No separate session URL required

## Key Differences

| Feature | SSEServerTransport (OLD) | StreamableHTTPServerTransport (NEW) |
|---------|--------------------------|-------------------------------------|
| Protocol Version | 2024-11-05 (deprecated) | 2025-03-26 (current) |
| Endpoints Required | 2 (GET for connect, POST for messages) | 1 (POST for everything) |
| Initial Response | `event: endpoint` + session URL | Direct JSON-RPC response |
| Request Handling | Via separate session endpoint | `transport.handleRequest(req, res, body)` |
| Claude Web UI Support | ❌ No | ✅ Yes |

## What Changed in the Fix

### 1. Import Statement
```diff
- import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
+ import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
```

### 2. Transport Creation
```diff
- const transport = new SSEServerTransport("/mcp", res);
- await server.connect(transport);
+ const transport = new StreamableHTTPServerTransport({
+   sessionIdGenerator: undefined,
+   enableJsonResponse: true
+ });
+ res.on('close', () => transport.close());
+ await server.connect(transport);
+ await transport.handleRequest(req, res, req.body);
```

### 3. Startup Message
```diff
- console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
+ console.log(`MCP endpoint (Streamable HTTP): http://localhost:${PORT}/mcp`);
+ console.log(`Protocol version: 2025-03-26`);
```

## How to Deploy

1. **Code is already pushed to GitHub:**
   ```
   https://github.com/cognizonline/Cogniz_Claude_MCP
   ```

2. **Trigger Render redeploy:**
   - Go to https://dashboard.render.com
   - Find service: `cogniz-claude-mcp`
   - Click **Manual Deploy** → **Deploy latest commit**

3. **Test the fix:**
   ```bash
   curl -X POST https://cogniz-claude-mcp.onrender.com/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
   ```

   Should return a proper JSON-RPC response, NOT `event: endpoint`.

4. **Connect in Claude Web UI:**
   - Settings → Connectors → Add Custom Connector
   - URL: `https://cogniz-claude-mcp.onrender.com/mcp`
   - Should show "Connected" status

## Expected Behavior After Fix

✅ Server starts with: `MCP endpoint (Streamable HTTP): http://localhost:10000/mcp`
✅ POST requests to /mcp return JSON-RPC responses
✅ Claude Web UI shows "Connected" status
✅ All 5 tools available in Claude Web UI:
   - `cogniz_store_memory`
   - `cogniz_search_memories`
   - `cogniz_get_memory`
   - `cogniz_delete_memory`
   - `cogniz_get_stats`

## References

- [MCP Streamable HTTP Spec](https://modelcontextprotocol.io/docs/concepts/transports)
- [Why MCP Deprecated SSE](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)
- [Cloudflare: Streamable HTTP for Python](https://blog.cloudflare.com/streamable-http-mcp-servers-python/)
- [MCP SDK npm Package](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
