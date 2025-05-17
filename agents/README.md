# AI For Web Developers | Agents Workshop - Introduction

## Prerequisites

You need access to a Large Language Model to follow along with this workshop. I recommend using IBM watsonx (cloud, 300k token free trial), OpenAI (cloud, no free trial) or Ollama (local) to access models.

- **IBM watsonx**: You can sign up for a [free trial](https://www.ibm.com/products/watsonx-ai) (300,000 free tokens), press "Start your free trial" and follow the instructions to create an IBM ID & IBM Cloud account. Use the region Dallas (`us-south`) when prompted.
- **OpenAI API**: You can sign up for a [free trial](https://platform.openai.com/) ($5 credit), press "Login" in top-right and follow the instructions.
- **Ollama**: You can download [Ollama](https://ollama.com/download) and run a LLM locally on your machine. Depending on the specs of your machine it can be slow or too heavy to install. After downloading Ollama, make sure to use the CLI command (`ollama run llama3.2` or ) to download the model (+/- 5GB) to your machine. **depending on your computer specs this might be slow and inefficient**.

When using IBM watsonx.ai or OpenAI you need to have an API Key. To get your API Key:

- **IBM watsonx**:
  - After signing up, wait for your sandbox to complete setting up.
  - Once the sandbox has loaded, open it and click the "Manage" tab. Copy the project ID from the "Details" section of the "General" page.
  - To get your API Key, open the hamburger menu in the top-left and select "Access (IAM)". This will open the IBM Cloud Console, in the menu you have to select ["API Keys"](https://cloud.ibm.com/iam/apikeys) and create a new API Key.
  - Store both the project ID and API Key somewhere safe as you need it later.
- **OpenAI API**:
  - After signing up, first check [here](https://platform.openai.com/settings/organization/billing/overview) if you have gotten the free credits. **If you did not get the free credits, you have to add your creditcard information**.
  - Open the [API Keys page](https://platform.openai.com/api-keys) and create a new API Key. Store the API Key somewhere safe as you need it later.

## Installation

The application we'll be building today is using [Next.js](https://vitejs.dev/), a framework for modern JavaScript (and TypeScript) applications.

We need to set up the initial, bootstrapped application for this workshop. Run the following commands to set it up:

```bash
npm install
npm run dev
```

Go the link displayed in your terminal, you should be seeing the intial application.

You're now ready to start with the excercises.

## Excercises

### Excercise 1 - Connect to a LLM

To interface with the LLMs, we need to install a library called LangChain:

```bash
npm install langchain @langchain/core @langchain/ollama

# Or for OpenAI
npm install langchain @langchain/core @langchain/openai

# Or for watsonx
npm install langchain @langchain/core @langchain/community
```

If you're not using Ollama, you need to copy the file `.env.sample` and add your own values for OpenAI or IBM watsonx.ai:

```bash
cp .env.sample .env
```

Save the file after adding your values.

Next, we'll create the connection to the model in `src/app/actions.ts`:

<details open>
    <summary>`src/app/actions.ts</summary>
  
    ```js
        "use server";

        // Import Chat interface
        import { ChatOllama } from "@langchain/ollama";
        // import { ChatOpenAI } from "@langchain/openai";
        // import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";

        import { createReactAgent } from "@langchain/langgraph/prebuilt";

        // ...
    ```

</details>

This will initialize a connection to the LLM Provider using LangChain and let us access the models. See here for all the supported models and their IDs:

- [Ollama]()
- [OpenAI](https://platform.openai.com/docs/models)
- [IBM watsonx](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-api-model-ids.html?context=wx&audience=wdp)

We'll create our first function that can be used to generate an answer for a question, add the following to the bottom of the file:

<details open>
    <summary>`src/app/actions.ts</summary>

    ```js
        export async function message(messages: StoredMessage[]) {
            const deserialized = mapStoredMessagesToChatMessages(messages);

            const llm =  new ChatOllama({ model: "llama3.2", temperature: 0 })
            // const llm = new ChatOpenAI({
            //     openAIApiKey: process.env.OPENAI_APIKEY,
            //     model: "gpt-3.5-turbo-instruct",
            //     temperature: 0 // lower temperature = less deterministic
            // });
            // const llm = new WatsonxAI({
            //     modelId: "ibm/granite-13b-instruct-v2",
            //     ibmCloudApiKey: process.env.WATSONX_APIKEY,
            //     projectId: process.env.WATSONX_PROJECT_ID,
            //     modelParameters: {
            //         temperature: 0
            //     },
            // });

            const agent = createReactAgent({
                llm,
                tools: [],
            });

            const response = await agent.invoke({
                messages: deserialized,
            });

            // Return the last message only
            return response.messages[response.messages.length - 1].content;
        }
    ```

</details>

You can try this out in the chat application and you should get a result.

### Excercise 2 - Add tools

Agents need tools in order to work with realtime data or to connect to external libaries. Langchain comes with a set of built-in tools that we can use. Let's take one of these tools and add the ability to get information from Wikipedia in `src/app/actions.ts`

<details open>
    <summary>`src/app/actions.ts</summary>

    ```js
    // ...
    import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

    export async function message(messages: StoredMessage[]) {
        // ...

        const wikipediaTool = new WikipediaQueryRun({
            topKResults: 1,
            maxDocContentLength: 100,
        });

        const agent = createReactAgent({
            llm,
            tools: [wikipediaTool],
        });

        const response = await agent.invoke({
            messages: deserialized,
        });

        return response.messages[response.messages.length - 1].content;
    }
    ```

</details>

The tool is able to search Wikipedia, meaning we can ask questions like:

- "What books did James Patterson wrote?"

And using the data on Wikipedia you will get an answer. Try to be creative and try your own questions, think of a topic for your agent and ask questions about your topic. For example: popular media, travel, books, etc.

Once you picked a topic, update the system prompt in `src/app/page.tsx`:

<details open>
    <summary>src/app/page.tsx</summary>

    ```js
    // ...
    export default function Home() {
    const [inputMessage, setInputMessage] = useState("");
    const [messages, setMessages] = useState<BaseMessage[]>([
        new SystemMessage(`
        You are a friendly assistant that answers questions about books and movies. Please answer my questions thorougly and don't hallucinate.
        `),
    ]);

    // ...
    }
    ```

</details>

### Excercise 3 - Create your own tools

Create a basic tool that takes one parameter in `src/app/actions.ts`. The tool will need a "tool definition" consisting of a name, description and input schema. We will take the same API that powers the Wikipedia tool from the previous exercise.

The APIs you can use are:

- Search Wikipedia (in this case for "James Patterson"): `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&formatversion=2&srsearch=james%20patterson`
- Retrieve a specific page (in this case "1022756"): `https://en.wikipedia.org/w/api.php?action=parse&format=json&pageid=1022756&formatversion=2`

<details open>
    <summary>src/app/actions.ts</summary>

    ```js
    // ...
    import { tool } from "@langchain/core/tools";
    import { z } from "zod";

    export async function message(messages: StoredMessage[]) {
        // ...

        const searchWikipediaTool = tool(
            async (input) => {
                if (!input.query) return "No search query provided";

                try {
                    const response = await fetch(
                        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&formatversion=2&srsearch=${encodeURIComponent(
                            input.query
                        )}`
                    );

                    const data = await response.json();

                    return JSON.stringify(data?.query?.search);
                } catch (e) {
                    return "Something went wrong.";
                }
            },
            {
                name: "search_wikipedia",
                description: "Search information on Wikipedia",
                schema: z.object({
                    query: z.string().describe("Search query"),
                }),
            }
        );

        const getWikipediaPageTool = tool(
            // ...
        )

    const agent = createReactAgent({
        llm,
        tools: [searchWikipediaTool, getWikipediaPageTool],
    });

    // ...
    }

    ```

</details>

Hint: The LLM might not always use the tool to retrieve a specific page to collect more information. You can trigger this behavior by updating the system prompt and tell the LLM to always retrieve more information from a matching Wikipedia page.

<details open>
    <summary>src/app/page.tsx</summary>

    ```js
    // ...
    export default function Home() {
    const [inputMessage, setInputMessage] = useState("");
    const [messages, setMessages] = useState<BaseMessage[]>([
        new SystemMessage(`
        You are a friendly assistant that answers questions about books and movies. Please answer my questions thorougly and don't hallucinate.

        When using the Wikipedia tool: always call the 'get_wikipedia_page' after using the 'search_wikipedia' to retrieve more information about a search topic.
        `),
    ]);

    // ...
    }
    ```

</details>

### Excercise 4 - Multi-agent (supervisor)

> Note: When using Ollama you might get issues when using a smaller model (less than 8B parameters).

There are many different patterns for multi-agent setups, in this exercise we'll focus on the supervisor pattern where a supervisor is handing off tasks to other agents and collects all the results.

For this we need to install another library from LangGraph:

```bash
npm i @langchain/langgraph-supervisor
```

And add this library to the imports in `src/app/actions.ts`, we'll also add pre-built tool that will be used by the second agent:

```js
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
```

Now, let's create the two agents and the supervisor agent. Use the instructions on [this page](https://github.com/langchain-ai/langgraphjs/tree/main/libs/langgraph-supervisor).

Finally, we need to delete the system prompt as this would be conflicting with the supervisor agent prompt:

<details open>
    <summary>src/app/page.tsx</summary>

    ```js
    export default function Home() {
        const [inputMessage, setInputMessage] = useState("");
        const [messages, setMessages] = useState<BaseMessage[]>([]);
        const [isLoading, setIsLoading] = useState(false);

        // ...
    }
    ```

</details>

Play with the system prompts to make it work better, be explicit when giving the model instructions. You can also try different models per agent to improve results (or efficiency as smaller tasks can be done by smaller (e.g. cheaper) models too).

### Excercise 5 - Build tools for Model Context Protocol (MCP)

Model Context Protocol (MCP) is a new standard for connecting agents to tools, destincting MCP Servers (the tools) and MCP Clients (the agents). There are 1000s of MCP servers available, meaning you can build agents much faster by using existing tools from these servers.

Move into the `/mcp` directory where you'll find some boilerplate code for building MCP servers:

```bash
cd ../mcp
```

This boilerplate code can be extended so that you'll get a new MCP server with two tools:

```js
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

      // logic for the search_wikipedia tool

      return {
        content: [
          {
            type: "text",
            text: "", // Add response here
          },
        ],
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

      // logic for the get_wikipedia_page tool

      return {
        content: [
          {
            type: "text",
            text: "", // Add response here
          },
        ],
      };
    } catch (e) {
      return { content: [{ type: "text", text: "Something went wrong." }] };
    }
  }
);

// ...
```

To use the MCP server you need to install all dependencies and build it first:

```bash
npm i
npm run build

# or to watch for changes
npm run watch
```

Then, you can start the MCP inspector to try out the MCP server tools in isolation:

```bash
npm run inspector
```

From the inspector you can try out the different tools using the `stdio` protocol.

Hint: Use two different terminal tabs/windows so you can keep the MCP inspector running. Use the "reconnect button" after making changes to your MCP server code.

### Excercise 6 - Using MCP in a MCP Client

The upside of MCP is that you can use every MCP server in any MCP client. Let's try our MCP server from a MCP client application like [Claude Desktop](https://modelcontextprotocol.io/clients#claude-desktop-app).

For Claude Desktop, follow [these instructions](https://modelcontextprotocol.io/quickstart/user) to set up the connection

Hint: You can also use other MCP client applications, see [here](https://modelcontextprotocol.io/clients) for a list of supported ones.

### Excercise 7 - Agent as MCP Client

```bash
npm install @langchain/mcp-adapters @modelcontextprotocol/sdk zod-to-json-schema
```

We're going to clear the contents of `src/app/actions.ts`, and add the import for `@langchain/mcp-adapters`:

```js
"use server";

import { ChatOllama } from "@langchain/ollama";
// import { ChatOpenAI } from "@langchain/openai";
// import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  mapStoredMessagesToChatMessages,
  StoredMessage,
} from "@langchain/core/messages";
import { z } from "zod";

import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const llm = new ChatOllama({ model: "llama3.2", temperature: 0 });
// const llm = new ChatOpenAI({
//     openAIApiKey: process.env.OPENAI_APIKEY,
//     model: "gpt-3.5-turbo-instruct",
//     temperature: 0 // lower temperature = less deterministic
// });
// const llm = new WatsonxAI({
//     modelId: "ibm/granite-13b-instruct-v2",
//     ibmCloudApiKey: process.env.WATSONX_APIKEY,
//     projectId: process.env.WATSONX_PROJECT_ID,
//     modelParameters: {
//         temperature: 0
//     },
// });

export async function message(messages: StoredMessage[]) {
  const deserialized = mapStoredMessagesToChatMessages(messages);

  const agent = createReactAgent({
    llm,
    tools: [],
  });

  const response = await agent.invoke({
    messages: deserialized,
  });

  return response.messages[response.messages.length - 1].content;
}
```

Then we'll need to connect the MCP server right above the `createReactAgent` logic:

```js
export async function message(messages: StoredMessage[]) {
  const deserialized = mapStoredMessagesToChatMessages(messages);

  // Create client and connect to server
  const client = new MultiServerMCPClient({
    throwOnLoadError: true,
    prefixToolNameWithServerName: true,
    additionalToolNamePrefix: "mcp",

    // Server configuration
    mcpServers: {
      wikipedia: {
        transport: "stdio",
        command: "node",
        // Replace with relative path to your mcp/build/index.js file
        args: [`../mcp/build/index.js`],
      },
    },
  });

  const mcpTools = await client.getTools();

  // ...
}
```

You can now restart the application (`npm run dev`) and ask questions related to the contents of Wikipedia.

### Excercise 8 - Add more MCP servers

You can connect any MCP server to the MCP adapter in our agent. Check out the following lists for different official MCP servers and community servers that have been built by other developers:

- https://github.com/modelcontextprotocol/servers
- https://github.com/punkpeye/awesome-mcp-servers

Hint: Try out a MCP server in the MCP inspector first.

### What's next?

There's much more you can do to extend your agent:

- Using workflows
- More multi-agent patterns
- Creating persistent memory
- Human-in-the-loop flows
