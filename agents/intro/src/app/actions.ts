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
  async (input) => {
    if (!input.pageId) return "No page id provided";

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=parse&format=json&pageid=${input.pageId.toString()}&formatversion=2`
      );

      const data = await response.json();

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

export async function message(messages: StoredMessage[]) {
  const deserialized = mapStoredMessagesToChatMessages(messages);

  const agent = createReactAgent({
    llm,
    tools: [searchWikipediaTool, getWikipediaPageTool],
  });

  const response = await agent.invoke({
    messages: deserialized,
  });

  return response.messages[response.messages.length - 1].content;
}
