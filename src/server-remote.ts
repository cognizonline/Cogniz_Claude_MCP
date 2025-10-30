#!/usr/bin/env node
/**
 * Cogniz Memory Platform - Remote MCP Server
 *
 * This is a Remote MCP server that can be deployed to cloud hosting services
 * and connected to Claude Web UI via Settings → Connectors → Add Custom Connector
 *
 * Uses HTTP/SSE transport for remote access instead of stdio
 */

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import axios from "axios";
import { z } from "zod";

// Response format enum
enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// Zod schemas for input validation
const StoreMemorySchema = z.object({
  content: z.string()
    .min(1, "Content cannot be empty")
    .max(50000, "Content must not exceed 50,000 characters")
    .describe("The memory content to store"),
  project_id: z.string()
    .optional()
    .describe("Project identifier (uses default if not provided)"),
  project_name: z.string()
    .optional()
    .describe("Human-readable project name (optional)"),
  category: z.string()
    .optional()
    .describe("Category tag for organization (e.g., 'meeting-notes', 'code-snippets', 'ideas')"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

const SearchMemoriesSchema = z.object({
  query: z.string()
    .min(2, "Query must be at least 2 characters")
    .max(500, "Query must not exceed 500 characters")
    .describe("Search query text to find relevant memories"),
  project_id: z.string()
    .optional()
    .describe("Limit search to specific project (optional)"),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Maximum number of results to return (1-100, default: 10)"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

const DeleteMemorySchema = z.object({
  memory_id: z.string()
    .min(1, "Memory ID cannot be empty")
    .describe("The unique identifier of the memory to delete"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

const GetStatsSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

const ListProjectsSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

// Type definitions
type StoreMemoryInput = z.infer<typeof StoreMemorySchema>;
type SearchMemoriesInput = z.infer<typeof SearchMemoriesSchema>;
type DeleteMemoryInput = z.infer<typeof DeleteMemorySchema>;
type GetStatsInput = z.infer<typeof GetStatsSchema>;
type ListProjectsInput = z.infer<typeof ListProjectsSchema>;

// Configuration from environment variables
const BASE_URL = process.env.COGNIZ_BASE_URL || "https://cogniz.online";
const DEFAULT_PROJECT_ID = process.env.COGNIZ_PROJECT_ID || "default";

// Optional: Fallback API key from environment (for testing/demo)
const FALLBACK_API_KEY = process.env.COGNIZ_API_KEY;

console.log("MCP Server Configuration:");
console.log("- Base URL:", BASE_URL);
console.log("- Project ID:", DEFAULT_PROJECT_ID);
console.log("- Auth Mode: User-provided API keys (OAuth Bearer tokens)");
if (FALLBACK_API_KEY) {
  console.log("- Fallback API Key available for demo/testing:", `${FALLBACK_API_KEY.substring(0, 10)}...`);
} else {
  console.log("- No fallback key - users must provide their own API keys");
}

const config = {
  base_url: BASE_URL,
  project_id: DEFAULT_PROJECT_ID
};

// Store current request context (API key from Authorization header)
let currentRequestApiKey: string | null = null;

// Get API key - prioritize user-provided, fall back to environment
function getCurrentApiKey(): string | null {
  // First: Use API key from current request's Authorization header
  if (currentRequestApiKey) {
    return currentRequestApiKey;
  }

  // Fallback: Use environment variable (for demo/testing)
  if (FALLBACK_API_KEY) {
    console.log("⚠️  Using fallback API key from environment (demo mode)");
    return FALLBACK_API_KEY;
  }

  return null;
}

// API client
async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  data?: Record<string, any>,
  params?: Record<string, string>
): Promise<T> {
  // Get API key from current context (session config, auth header, or fallback)
  const apiKey = getCurrentApiKey();

  if (!apiKey) {
    throw new Error("No API key available. Please configure your API key in Claude Desktop settings. Get your API key from https://cogniz.online/dashboard → API Reference");
  }

  const url = `${config.base_url}/wp-json/memory/v1${endpoint}`;

  console.log(`API Request: ${method} ${url}`);
  console.log(`Using API key: ${apiKey.substring(0, 10)}...`);
  if (params) console.log("Query params:", params);
  if (data) console.log("Request data:", JSON.stringify(data).substring(0, 100));

  try {
    const response = await axios({
      method,
      url,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Cogniz-MCP-Server/1.0 (Model Context Protocol)"
      },
      data,
      params,
      timeout: 30000
    });

    console.log(`API Response: ${response.status}`, typeof response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error for ${method} ${url}:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

// Error handling
function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return "Error: Resource not found. Please check the ID is correct.";
        case 403:
          return "Error: Permission denied. Check your API key has access to this resource.";
        case 429:
          return "Error: Rate limit exceeded. Please wait before making more requests.";
        case 401:
          return "Error: Authentication failed. Please check your API key is valid.";
        default:
          return `Error: API request failed with status ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    } else if (error.code === "ENOTFOUND") {
      return `Error: Could not connect to ${config.base_url}. Please check the URL is correct.`;
    }
  }
  return `Error: ${error instanceof Error ? error.message : String(error)}`;
}

// Create Express app
const app = express();

// CORS middleware for Claude Web UI
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "cogniz-mcp-server" });
});

// OAuth Protected Resource metadata (RFC 9728)
// Tells clients we support multiple auth methods
app.get("/.well-known/oauth-protected-resource", (req, res) => {
  res.json({
    resource: "https://cogniz-claude-mcp.onrender.com/mcp",
    authorization_servers: [],  // No OAuth server - users provide API keys directly
    bearer_methods_supported: ["header", "query"],  // Support both header and query param
    resource_documentation: "https://github.com/cognizonline/Cogniz_Claude_MCP",
    // Custom fields: Tell users how to authenticate
    authentication_methods: {
      header: "Authorization: Bearer YOUR_API_KEY (recommended)",
      query: "?api_key=YOUR_API_KEY (for Web UIs)"
    },
    api_key_instructions: "Get your API key from https://cogniz.online/dashboard → API Reference"
  });
});

// Alternative: Return 404 if not using OAuth
// This tells Claude: "No OAuth, use simple Bearer token"
app.get("/.well-known/oauth-authorization-server", (req, res) => {
  res.status(404).json({
    error: "no_oauth",
    message: "This server uses simple Bearer token authentication, not OAuth. Provide your Cogniz API key as the Bearer token.",
    instructions: "Get your API key from https://cogniz.online/settings"
  });
});

// Create MCP server
const server = new McpServer({
  name: "cogniz-memory-platform",
  version: "1.0.0"
});

// Register all tools (same as local version)
server.registerTool(
  "cogniz_store_memory",
  {
    title: "Store Memory in Cogniz Platform",
    description: `Store a new memory in the Cogniz Memory Platform for persistent context across sessions.`,
    inputSchema: StoreMemorySchema.shape,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    }
  },
  async (params: StoreMemoryInput) => {
    try {
      const requestData: Record<string, any> = {
        content: params.content,
        project_id: params.project_id || config.project_id,
        ai_platform: "claude-remote-mcp"
      };

      if (params.project_name) requestData.project_name = params.project_name;
      if (params.category) requestData.category = params.category;

      const result = await makeApiRequest<any>("/store", "POST", requestData);

      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          "# Memory Stored Successfully",
          "",
          `**Memory ID**: ${result.memory_id}`,
          `**Project**: ${result.project_name || result.project_id}`,
          `**Compressed**: ${result.compressed ? 'Yes' : 'No'}`,
          "",
          "Your memory has been saved to the Cogniz platform."
        ];
        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              memory_id: result.memory_id,
              project: result.project_name || result.project_id,
              compressed: result.compressed || false,
              message: "Memory stored successfully"
            }, null, 2)
          }]
        };
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "cogniz_search_memories",
  {
    title: "Search Cogniz Memories",
    description: `Search for memories using semantic search across all stored memories in Cogniz Platform.`,
    inputSchema: SearchMemoriesSchema.shape,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: SearchMemoriesInput) => {
    try {
      const searchParams: Record<string, string> = {
        query: params.query,
        limit: params.limit.toString(),
        project_id: params.project_id || config.project_id || "default"
      };

      const response = await makeApiRequest<any>("/search", "GET", undefined, searchParams);

      // API returns {query, results: [...], storage_type} - extract the results array
      const results = Array.isArray(response) ? response : (response.results || []);

      if (!results || results.length === 0) {
        const msg = `No memories found matching '${params.query}'`;
        return {
          content: [{ type: "text", text: msg }]
        };
      }

      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          `# Search Results: "${params.query}"`,
          "",
          `Found ${results.length} ${results.length === 1 ? 'memory' : 'memories'}`,
          ""
        ];

        for (const mem of results) {
          if (mem.category && mem.category !== 'unknown') {
            lines.push(`**Category**: ${mem.category}`);
          }
          if (mem.relevance) {
            lines.push(`**Relevance**: ${(mem.relevance * 100).toFixed(0)}%`);
          }
          lines.push(`**Stored**: ${mem.stored_at || 'Unknown'}`);
          lines.push("");
          const preview = mem.content.substring(0, 300);
          lines.push(preview + (mem.content.length > 300 ? "..." : ""));
          lines.push("");
          lines.push(`*Memory ID: ${mem.memory_id || mem.id}*`);
          lines.push("---");
          lines.push("");
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              count: results.length,
              memories: results.map((m: any) => ({
                memory_id: m.memory_id || m.id,
                content: m.content.substring(0, 200) + (m.content.length > 200 ? "..." : ""),
                category: m.category,
                relevance: m.relevance,
                stored_at: m.stored_at
              }))
            }, null, 2)
          }]
        };
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "cogniz_delete_memory",
  {
    title: "Delete Memory from Cogniz Platform",
    description: `Delete a specific memory from the Cogniz Memory Platform.`,
    inputSchema: DeleteMemorySchema.shape,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: DeleteMemoryInput) => {
    try {
      await makeApiRequest(`/delete/${params.memory_id}`, "DELETE");

      if (params.response_format === ResponseFormat.MARKDOWN) {
        return {
          content: [{
            type: "text",
            text: `# Memory Deleted\n\nSuccessfully deleted memory: ${params.memory_id}`
          }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              memory_id: params.memory_id,
              message: "Memory deleted successfully"
            }, null, 2)
          }]
        };
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "cogniz_get_stats",
  {
    title: "Get Cogniz Platform Statistics",
    description: `Retrieve your Cogniz Memory Platform usage statistics and account information.`,
    inputSchema: GetStatsSchema.shape,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: GetStatsInput) => {
    try {
      console.log("Calling /user-stats API...");
      const stats = await makeApiRequest<any>("/user-stats", "GET");
      console.log("Stats response:", JSON.stringify(stats));

      if (!stats) {
        throw new Error("No stats data returned from API");
      }

      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          "# Cogniz Platform Statistics",
          "",
          `**Plan**: ${stats.plan_name || stats.plan}`,
          `**Projects**: ${stats.projects_count} / ${stats.projects_limit === -1 ? 'Unlimited' : stats.projects_limit}`,
          `**Total Memories**: ${stats.total_memories}`,
          `**Storage Used**: ${stats.memory_usage_mb} MB / ${stats.memory_limit_mb} MB`,
          `**API Calls This Month**: ${stats.api_calls_month} / ${stats.api_calls_limit}`,
          `**Compression Ratio**: ${stats.avg_compression}x`,
          ""
        ];

        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              stats: {
                plan: stats.plan_name || stats.plan,
                plan_active: stats.plan_active,
                projects_count: stats.projects_count,
                projects_limit: stats.projects_limit,
                total_memories: stats.total_memories,
                memory_usage_mb: stats.memory_usage_mb,
                memory_limit_mb: stats.memory_limit_mb,
                api_calls_month: stats.api_calls_month,
                api_calls_limit: stats.api_calls_limit,
                avg_compression: stats.avg_compression,
                next_billing_date: stats.next_billing_date
              }
            }, null, 2)
          }]
        };
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "cogniz_list_projects",
  {
    title: "List Cogniz Projects",
    description: `List all projects in your Cogniz Memory Platform account.`,
    inputSchema: ListProjectsSchema.shape,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: ListProjectsInput) => {
    try {
      const response = await makeApiRequest<any>("/projects", "GET");

      // API might return array directly or {projects: [...]} - handle both
      const projects = Array.isArray(response) ? response : (response.projects || []);

      if (!projects || projects.length === 0) {
        return {
          content: [{ type: "text", text: "No projects found." }]
        };
      }

      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          "# Your Projects",
          "",
          `Total: ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`,
          ""
        ];

        for (const proj of projects) {
          lines.push(`## ${proj.project_name || proj.name || proj.project_id}`);
          lines.push(`**Project ID**: ${proj.project_id}`);
          lines.push(`**Total Memories**: ${proj.total_memories || 0}`);
          lines.push(`**Storage**: ${proj.total_size_mb || 0} MB`);
          lines.push(`**Compression**: ${proj.average_compression}x`);
          lines.push(`**Last Accessed**: ${proj.last_accessed}`);
          lines.push(`**Created**: ${proj.created_at}`);
          lines.push("");
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              count: projects.length,
              projects: projects.map((p: any) => ({
                id: p.id,
                project_id: p.project_id,
                project_name: p.project_name,
                total_memories: p.total_memories,
                total_size_mb: p.total_size_mb,
                average_compression: p.average_compression,
                last_accessed: p.last_accessed,
                created_at: p.created_at
              }))
            }, null, 2)
          }]
        };
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Streamable HTTP endpoint (MCP 2025-03-26 spec)
app.post("/mcp", async (req, res) => {
  console.log("New MCP connection from:", req.headers['user-agent']);
  console.log("Accept header:", req.headers['accept']);

  // Extract API key from multiple sources (in order of preference)

  // Method 1: Authorization header (preferred - for Claude Desktop)
  const authHeader = req.headers['authorization'] as string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    currentRequestApiKey = authHeader.substring(7); // Remove "Bearer " prefix
    console.log("✓ API key from Authorization header:", currentRequestApiKey.substring(0, 10) + "...");
  }
  // Method 2: Query parameter (for Web UIs that can't send headers)
  else if (req.query.api_key) {
    currentRequestApiKey = req.query.api_key as string;
    console.log("✓ API key from query parameter:", currentRequestApiKey.substring(0, 10) + "...");
    console.log("⚠️  Note: Query params are less secure than headers. Use Authorization header when possible.");
  }
  // Method 3: No user key provided
  else {
    currentRequestApiKey = null;
    console.log("⚠️  No API key provided - will use fallback if configured");
  }

  try {
    // Check if we have an API key (user-provided or fallback)
    const apiKey = getCurrentApiKey();
    if (!apiKey) {
      console.error("ERROR: No API key available");
      if (!res.headersSent) {
        return res.status(401).json({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Authentication required. Please provide your Cogniz API key via:\n' +
                     '1. Authorization header: "Bearer YOUR_API_KEY" (recommended)\n' +
                     '2. Query parameter: ?api_key=YOUR_API_KEY (for Web UIs)\n\n' +
                     'Get your API key from https://cogniz.online/dashboard → API Reference'
          },
          id: null
        });
      }
      return;
    }

    console.log("Using API key:", apiKey.substring(0, 10) + "...");

    // Create a new StreamableHTTPServerTransport for this request
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode - no session persistence
      enableJsonResponse: true // Support both JSON and SSE responses
    });

    // Close transport and clear API key when response ends
    res.on('close', () => {
      transport.close();
      currentRequestApiKey = null; // Clear API key after request
    });

    // Connect server and handle the request
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    console.log("Streamable HTTP request handled successfully");

    // Clear API key after successful request
    currentRequestApiKey = null;
  } catch (error) {
    console.error("MCP connection error:", error);
    // Clear API key on error
    currentRequestApiKey = null;

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null
      });
    }
  }
});

// Legacy SSE endpoint - no longer needed with Streamable HTTP
// Inform users to use POST /mcp instead
app.get("/sse", (req, res) => {
  res.status(410).json({
    error: "SSE-only transport is deprecated",
    message: "Please use POST /mcp with Streamable HTTP protocol (2025-03-26 spec)",
    documentation: "https://modelcontextprotocol.io/docs/concepts/transports"
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cogniz Remote MCP Server running on port ${PORT}`);
  console.log(`MCP endpoint (Streamable HTTP): http://localhost:${PORT}/mcp`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Protocol version: 2025-03-26`);
});
