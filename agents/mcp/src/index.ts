import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create MCP server instance
const server = new McpServer({
  name: "wikipedia", // Name of the server
  version: "1.0.0",
});

// MCP Server Tool Definition
server.tool(
  "search_wikipedia", // Name of the tool
  "Search information on Wikipedia", // Description of the tool
  // Input paramters
  {
    query: z.string().describe("Search query"),
  },
  async ({ query }) => {
    try {
      if (!query) throw new Error();

      // Logic for the tool

      return {
        content: [{ type: "text", text: "" }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: "Something went wrong." }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
