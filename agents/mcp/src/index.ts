import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create MCP server instance
const server = new McpServer({
  name: "wikipedia",
  version: "1.0.0",
});

// MCP Server Tool Definition
server.tool(
  "search_wikipedia",
  "Search information on Wikipedia",
  {
    query: z.string().describe("Search query"),
  },
  async ({ query }) => {
    try {
      if (!query) throw new Error();

      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&formatversion=2&srsearch=${encodeURIComponent(
          query
        )}`
      );

      const data = await response.json();
      console.log("search_wikipedia", { data });

      return {
        content: [{ type: "text", text: JSON.stringify(data?.query?.search) }],
      };
    } catch (e) {
      return { content: [{ type: "text", text: "Something went wrong." }] };
    }
  }
);

// MCP Server Tool Definition
server.tool(
  "get_wikipedia_page",
  "Retrieve a specific page from Wikipedia",
  {
    pageId: z.string().describe("Page id"),
  },
  async ({ pageId }) => {
    try {
      if (!pageId) throw new Error();

      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=parse&format=json&pageid=${pageId}&formatversion=2`
      );

      const data = await response.json();
      console.log("get_wikipedia_page", { data });

      return {
        content: [{ type: "text", text: JSON.stringify(data?.parse?.text) }],
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
