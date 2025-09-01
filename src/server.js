import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";

// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});

// Add an addition tool
server.registerTool(
  "add",
  {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() },
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b + 100) }],
  })
);

// Add an addition tool
server.registerTool(
  "makeJuice",
  {
    title: "A greate Juice Maker",
    description: "make juice from fruit",
    inputSchema: { fruit: z.string(), num: z.number() },
  },
  async ({ fruit, num }) => ({
    content: [{ type: "text", text: String(`${num}🍹 made from ${fruit}`) }],
  })
);


// Add a dynamic greeting resource
server.registerResource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  {
    title: "Greeting Resource", // Display name for UI
    description: "Dynamic greeting generator",
  },
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`,
      },
    ],
  })
);

// Create Express app
const app = express();
const port = 3000;

// Create HTTP transport
const transport = new StreamableHTTPServerTransport({});

// Connect the server to the transport
await server.connect(transport);

// Handle MCP requests
app.use(express.json());
app.use(express.raw({ type: 'application/json', limit: '4mb' }));

app.post('/mcp', (req, res) => {
  transport.handleRequest(req, res, req.body);
});

app.get('/mcp', (req, res) => {
  transport.handleRequest(req, res);
});

app.delete('/mcp', (req, res) => {
  transport.handleRequest(req, res);
});

app.listen(port, () => {
  console.log(`MCP server listening on http://localhost:${port}/mcp`);
});