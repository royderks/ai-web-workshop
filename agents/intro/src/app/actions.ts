"use server";

import { ChatOllama } from "@langchain/ollama";
// import { OpenAI } from "@langchain/openai";
// import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  mapStoredMessagesToChatMessages,
  StoredMessage,
} from "@langchain/core/messages";

import { MultiServerMCPClient } from "@langchain/mcp-adapters";

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

  if (mcpTools.length === 0) {
    throw new Error("No tools found");
  }

  const agent = createReactAgent({
    llm,
    tools: mcpTools,
  });

  const response = await agent.invoke({
    messages: deserialized,
  });

  return response.messages[response.messages.length - 1].content;
}
