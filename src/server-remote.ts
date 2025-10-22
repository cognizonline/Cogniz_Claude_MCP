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
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
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
const API_KEY = process.env.COGNIZ_API_KEY;
const BASE_URL = process.env.COGNIZ_BASE_URL || "https://cogniz.online";
const DEFAULT_PROJECT_ID = process.env.COGNIZ_PROJECT_ID || "default";

if (!API_KEY) {
  throw new Error("COGNIZ_API_KEY environment variable is required");
}

const config = {
  api_key: API_KEY,
  base_url: BASE_URL,
  project_id: DEFAULT_PROJECT_ID
};

// API client
async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  data?: Record<string, any>,
  params?: Record<string, string>
): Promise<T> {
  const url = `${config.base_url}/wp-json/memory/v1${endpoint}`;

  const response = await axios({
    method,
    url,
    headers: {
      "Authorization": `Bearer ${config.api_key}`,
      "Content-Type": "application/json"
    },
    data,
    params,
    timeout: 30000
  });

  return response.data;
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

      const results = await makeApiRequest<any[]>("/search", "GET", undefined, searchParams);

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
          lines.push(`## ${mem.project_name || 'Unnamed Project'}`);
          lines.push(`**Relevance**: ${(mem.relevance_score * 100).toFixed(0)}%`);
          if (mem.category) {
            lines.push(`**Category**: ${mem.category}`);
          }
          lines.push(`**Created**: ${new Date(mem.created_at).toLocaleDateString()}`);
          lines.push("");
          const preview = mem.content.substring(0, 200);
          lines.push(preview + (mem.content.length > 200 ? "..." : ""));
          lines.push("");
          lines.push(`*Memory ID: ${mem.id}*`);
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
              memories: results.map(m => ({
                id: m.id,
                content: m.content.substring(0, 200) + (m.content.length > 200 ? "..." : ""),
                project: m.project_name,
                category: m.category,
                relevance: m.relevance_score,
                created: m.created_at
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
      const stats = await makeApiRequest<any>("/user-stats", "GET");

      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          "# Cogniz Platform Statistics",
          "",
          `**Plan**: ${stats.plan_name}`,
          `**Projects**: ${stats.projects_count}`,
          `**Total Memories**: ${stats.total_memories}`,
          `**Storage Used**: ${stats.storage_used_mb} MB`,
          ""
        ];

        if (stats.recent_activity && stats.recent_activity.length > 0) {
          lines.push("## Recent Activity");
          lines.push("");
          for (const activity of stats.recent_activity.slice(0, 5)) {
            lines.push(`- ${activity.action} (${new Date(activity.timestamp).toLocaleDateString()})`);
          }
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
              stats: {
                plan: stats.plan_name,
                projects: stats.projects_count,
                memories: stats.total_memories,
                storage_mb: stats.storage_used_mb,
                recent_activity: stats.recent_activity
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
      const projects = await makeApiRequest<any[]>("/projects", "GET");

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
          lines.push(`## ${proj.name || proj.id}`);
          if (proj.description) {
            lines.push(proj.description);
          }
          lines.push(`**Memories**: ${proj.memory_count || 0}`);
          lines.push(`**Created**: ${new Date(proj.created_at).toLocaleDateString()}`);
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
              projects: projects.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                memory_count: p.memory_count,
                created: p.created_at
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

  try {
    // Check if client accepts SSE for streaming responses
    const acceptsSSE = req.headers['accept']?.includes('text/event-stream');

    if (acceptsSSE) {
      // Use SSE transport for streaming
      const transport = new SSEServerTransport("/mcp", res);
      await server.connect(transport);
      console.log("SSE transport connected successfully");
    } else {
      // JSON-only response
      res.setHeader('Content-Type', 'application/json');
      const transport = new SSEServerTransport("/mcp", res);
      await server.connect(transport);
      console.log("JSON transport connected successfully");
    }
  } catch (error) {
    console.error("MCP connection error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to establish MCP connection" });
    }
  }
});

// Legacy SSE endpoint for backward compatibility
app.get("/sse", async (req, res) => {
  console.log("Legacy SSE connection (redirecting to /mcp)");
  // Redirect GET /sse to POST /mcp for backward compatibility
  res.status(301).setHeader('Location', '/mcp').end();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cogniz Remote MCP Server running on port ${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
