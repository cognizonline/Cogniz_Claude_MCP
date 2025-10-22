#!/usr/bin/env node
/**
 * Cogniz Memory Platform MCP Server
 *
 * Provides MCP tools for interacting with Cogniz Memory Platform API.
 * Enables Claude to store, search, and manage memories across platforms.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// Constants
const CHARACTER_LIMIT = 25000;

// Configuration interface
interface CognizConfig {
  api_key: string;
  base_url: string;
  project_id?: string;
}

// Load config from ~/.cogniz/config.json
function loadConfig(): CognizConfig {
  const configPath = join(homedir(), ".cogniz", "config.json");
  try {
    const configData = readFileSync(configPath, "utf-8");
    return JSON.parse(configData);
  } catch (error) {
    console.error("ERROR: Could not load config from ~/.cogniz/config.json");
    console.error("Please create the config file with: api_key, base_url, project_id");
    console.error("Example:");
    console.error(JSON.stringify({
      api_key: "mp_1_YourAPIKey",
      base_url: "https://cogniz.online",
      project_id: "default"
    }, null, 2));
    process.exit(1);
  }
}

const config = loadConfig();
const API_ROOT = `${config.base_url.replace(/\/$/, "")}/wp-json/memory/v1`;

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
    .describe("Project ID (optional, uses default from config if not provided)"),
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
    .min(1, "Memory ID is required")
    .describe("The unique memory ID to delete (e.g., 'local_abc123' or 'memory_123')"),
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

// Shared API request function
async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  data?: any,
  params?: Record<string, string>
): Promise<T> {
  try {
    const url = `${API_ROOT}${endpoint}`;

    const response = await axios({
      method,
      url,
      data,
      params,
      timeout: 30000,
      headers: {
        "Authorization": `Bearer ${config.api_key}`,
        "Content-Type": "application/json",
        "X-Memory-Platform-Client": "cogniz-mcp-server",
        "Accept": "application/json"
      }
    });

    return response.data;
  } catch (error) {
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

// Create MCP server
const server = new McpServer({
  name: "cogniz-memory-platform",
  version: "1.0.0"
});

// Register tool: Store memory
server.registerTool(
  "cogniz_store_memory",
  {
    title: "Store Memory in Cogniz Platform",
    description: `Store a new memory in the Cogniz Memory Platform for persistent context across sessions.

This tool saves conversation context, important information, code snippets, meeting notes, or any content you want to remember across different Claude sessions. Memories are searchable and organized by project.

Args:
  - content (string, required): The memory content to store (1-50,000 characters)
  - project_id (string, optional): Project identifier (uses config default if not provided)
  - project_name (string, optional): Human-readable project name
  - category (string, optional): Category tag like 'meeting-notes', 'code-snippets', 'ideas'
  - response_format ('markdown' | 'json', optional): Output format (default: 'markdown')

Returns:
  For JSON format:
  {
    "success": true,
    "memory_id": "local_abc123...",
    "project": "Project Name",
    "compressed": boolean,
    "message": "Memory stored successfully"
  }

  For Markdown format: Human-readable confirmation message

Examples:
  - Use when: "Remember this database schema for later" -> Store with category='code-snippets'
  - Use when: "Save meeting summary" -> Store with category='meeting-notes'
  - Don't use when: Searching for existing memories (use cogniz_search_memories instead)

Error Handling:
  - Returns "Error: Content cannot be empty" if content is missing
  - Returns "Error: Permission denied" if API key is invalid`,
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
      const result = await makeApiRequest<any>("/store", "POST", {
        content: params.content,
        project_id: params.project_id || config.project_id,
        project_name: params.project_name,
        category: params.category,
        ai_platform: "claude-mcp"
      });

      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          "# ✅ Memory Stored Successfully",
          "",
          `**Memory ID**: ${result.memory_id}`,
          `**Project**: ${result.project_name || result.project_id || config.project_id}`,
          result.compressed ? `**Compressed**: Yes` : "",
          params.category ? `**Category**: ${params.category}` : "",
          "",
          "Your memory has been saved and can be retrieved in future sessions."
        ].filter(Boolean);

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

// Register tool: Search memories
server.registerTool(
  "cogniz_search_memories",
  {
    title: "Search Cogniz Memories",
    description: `Search for memories using semantic search across all stored memories in Cogniz Platform.

This tool performs intelligent semantic search to find relevant memories based on your query. It searches across all content, categories, and projects to find the best matches.

Args:
  - query (string, required): Search query text (2-500 characters)
  - project_id (string, optional): Limit search to specific project
  - limit (number, optional): Maximum results to return (1-100, default: 10)
  - response_format ('markdown' | 'json', optional): Output format (default: 'markdown')

Returns:
  For JSON format:
  {
    "success": true,
    "count": number,
    "memories": [
      {
        "id": "memory_id",
        "content": "content preview (200 chars)...",
        "project": "Project Name",
        "category": "category-name",
        "relevance": 0.95,
        "created": "2025-01-20T10:30:00Z"
      }
    ]
  }

  For Markdown format: Formatted list with relevance scores and previews

Examples:
  - Use when: "Find all meeting notes from last week"
  - Use when: "Search for database schema information"
  - Use when: "What did we discuss about the API design?"
  - Don't use when: Storing new memories (use cogniz_store_memory instead)

Error Handling:
  - Returns "No memories found matching '<query>'" if search returns empty
  - Returns helpful error if query is too short or too long`,
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

// Register tool: Delete memory
server.registerTool(
  "cogniz_delete_memory",
  {
    title: "Delete Cogniz Memory",
    description: `Delete a specific memory from Cogniz Platform by its unique ID.

This tool permanently removes a memory. This action cannot be undone.

Args:
  - memory_id (string, required): The unique memory ID (e.g., 'local_abc123' or 'memory_456')
  - response_format ('markdown' | 'json', optional): Output format (default: 'markdown')

Returns:
  Confirmation message that memory was deleted successfully

Examples:
  - Use when: "Delete memory local_abc123"
  - Use when: "Remove that old meeting note"
  - Don't use when: You want to update a memory (delete and create new instead)

Error Handling:
  - Returns "Error: Resource not found" if memory_id doesn't exist
  - Returns "Error: Permission denied" if you don't own this memory`,
    inputSchema: DeleteMemorySchema.shape,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: DeleteMemoryInput) => {
    try {
      await makeApiRequest(`/delete/${params.memory_id}`, "DELETE");

      if (params.response_format === ResponseFormat.MARKDOWN) {
        return {
          content: [{
            type: "text",
            text: `# ✅ Memory Deleted\n\n**Memory ID**: ${params.memory_id}\n\nThe memory has been permanently removed.`
          }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Memory ${params.memory_id} deleted successfully`
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

// Register tool: Get stats
server.registerTool(
  "cogniz_get_stats",
  {
    title: "Get Cogniz Usage Statistics",
    description: `Get usage statistics and plan information for your Cogniz Platform account.

This tool retrieves your current plan details, project counts, memory usage, storage usage, and API usage statistics.

Args:
  - response_format ('markdown' | 'json', optional): Output format (default: 'markdown')

Returns:
  For JSON format:
  {
    "success": true,
    "stats": {
      "plan": "Enterprise Plan",
      "projects": "27 / unlimited",
      "memories": 145,
      "storage": "0.17 MB / 10240 MB",
      "api_calls_month": 1113,
      "avg_compression": "1.77x"
    }
  }

  For Markdown format: Formatted statistics dashboard

Examples:
  - Use when: "How many memories do I have?"
  - Use when: "What's my current plan?"
  - Use when: "Show my Cogniz statistics"

Error Handling:
  - Returns error if API key is invalid`,
    inputSchema: GetStatsSchema.shape,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
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
          `**Projects**: ${stats.projects_count} / ${stats.projects_limit === -1 ? 'unlimited' : stats.projects_limit}`,
          `**Total Memories**: ${stats.total_memories}`,
          `**Storage Used**: ${stats.memory_usage_mb.toFixed(2)} MB / ${stats.memory_limit_mb} MB`,
          `**API Calls This Month**: ${stats.api_calls_month}`,
          `**Average Compression**: ${stats.avg_compression.toFixed(2)}x`,
          "",
          stats.plan_active ? "✅ Plan Active" : "❌ Plan Inactive"
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
                plan: stats.plan_name,
                projects: `${stats.projects_count} / ${stats.projects_limit === -1 ? 'unlimited' : stats.projects_limit}`,
                memories: stats.total_memories,
                storage: `${stats.memory_usage_mb.toFixed(2)} MB / ${stats.memory_limit_mb} MB`,
                api_calls_month: stats.api_calls_month,
                avg_compression: stats.avg_compression.toFixed(2) + "x"
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

// Register tool: List projects
server.registerTool(
  "cogniz_list_projects",
  {
    title: "List Cogniz Projects",
    description: `List all projects in your Cogniz Platform account with memory counts and activity dates.

This tool retrieves all your projects, showing how many memories each contains and when it was last updated.

Args:
  - response_format ('markdown' | 'json', optional): Output format (default: 'markdown')

Returns:
  For JSON format:
  {
    "success": true,
    "count": number,
    "projects": [
      {
        "id": "project-id",
        "name": "Project Name",
        "memories": 42,
        "last_updated": "2025-01-20"
      }
    ]
  }

  For Markdown format: Formatted project list with details

Examples:
  - Use when: "Show all my projects"
  - Use when: "Which project has the most memories?"
  - Use when: "List my Cogniz projects"

Error Handling:
  - Returns empty list if no projects exist`,
    inputSchema: ListProjectsSchema.shape,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: ListProjectsInput) => {
    try {
      const projects = await makeApiRequest<any[]>("/projects", "GET");

      if (!projects || projects.length === 0) {
        return {
          content: [{ type: "text", text: "No projects found. Create your first memory to start a project!" }]
        };
      }

      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          `# Cogniz Projects (${projects.length})`,
          ""
        ];

        for (const proj of projects) {
          lines.push(`## ${proj.name || proj.id}`);
          lines.push(`**Memories**: ${proj.memory_count}`);
          lines.push(`**Last Activity**: ${new Date(proj.last_activity).toLocaleDateString()}`);
          lines.push(`**Project ID**: ${proj.id}`);
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
                memories: p.memory_count,
                last_updated: p.last_activity
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

// Main function
async function main() {
  console.error("Starting Cogniz MCP Server...");
  console.error(`API Base: ${API_ROOT}`);
  console.error(`Config loaded from: ${join(homedir(), ".cogniz", "config.json")}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Cogniz MCP Server running on stdio");
  console.error("Tools available: cogniz_store_memory, cogniz_search_memories, cogniz_delete_memory, cogniz_get_stats, cogniz_list_projects");
}

// Run the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
