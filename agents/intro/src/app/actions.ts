"use server";

import { ChatOllama } from "@langchain/ollama";
// import { OpenAI } from "@langchain/openai";
// import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  mapStoredMessagesToChatMessages,
  StoredMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { createSupervisor } from "@langchain/langgraph-supervisor";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

const llm = new ChatOllama({ model: "llama3.2", temperature: 0 });
// const llm = new OpenAI({
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

const webSearchTool = new DuckDuckGoSearch({ maxResults: 4 });

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
      console.log("search_wikipedia", { data });

      fs.appendFile(
        "example.txt",
        JSON.stringify(data?.query?.search),
        (err) => {
          if (err) {
            console.error("An error occurred:", err);
          } else {
            console.log("File has been appended successfully");
          }
        }
      );

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
  async (input) => {
    if (!input.pageId) return "No page id provided";

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=parse&format=json&pageid=${input.pageId.toString()}&formatversion=2`
      );

      const data = await response.json();
      console.log("get_wikipedia_page", { data });

      return JSON.stringify(data?.parse?.text);
    } catch (e) {
      return "Something went wrong.";
    }
  },
  {
    name: "get_wikipedia_page",
    description: "Retrieve a specific page from Wikipedia",
    schema: z.object({
      pageId: z.string().describe("Page id"),
    }),
  }
);

// Agent 1
const wikipediaAgent = createReactAgent({
  llm: llm,
  tools: [searchWikipediaTool, getWikipediaPageTool],
  name: "wikipedia_expert",
  prompt:
    "You are a Wikipedia expert. DO NOT RETURN INFORMATION WITHOUT USING A TOOL. Use the 'search_wikipedia' tool to find things on Wikipedia using natural language, and only use the 'get_wikipedia_page' tool when you have a wikipedia page id. Never answer based on training data, always use tools. Use tools without asking.",
});

// Agent 2
const searchAgent = createReactAgent({
  llm: llm,
  tools: [webSearchTool],
  name: "research_expert",
  prompt:
    "You are a Research expert. DO NOT RETURN INFORMATION WITHOUT USING A TOOL. Search the web to find relevant information. Never answer based on training data, always use tools. Use tools without asking.",
});

export async function message(messages: StoredMessage[]) {
  const deserialized = mapStoredMessagesToChatMessages(messages);

  // Create supervisor workflow
  const workflow = createSupervisor({
    agents: [searchAgent, wikipediaAgent],
    llm,
    prompt: `You are a team supervisor managing a wikipedia expert and a research expert. Always use all experts at your disposal to return comprehensive information.`,
    outputMode: "full_history",
  });

  // Compile and run
  const app = workflow.compile();
  const response = await app.invoke({
    messages: deserialized,
  });

  console.log({ response: response.messages });

  return response.messages[response.messages.length - 1].content;
}
