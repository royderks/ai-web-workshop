"use server";

import { ChatOllama } from "@langchain/ollama";
// import { ChatWatsonx } from "@langchain/community/chat_models/ibm";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  mapStoredMessagesToChatMessages,
  StoredMessage,
} from "@langchain/core/messages";

export async function message(messages: StoredMessage[]) {
  const deserialized = mapStoredMessagesToChatMessages(messages);

  const agent = createReactAgent({
    llm: new ChatOllama({ model: "llama3.2", temperature: 0 }),
    // llm: new ChatWatsonx({
    //   model: "mistralai/mistral-large",
    //   projectId: process.env.WATSONX_AI_PROJECT_ID,
    //   serviceUrl: process.env.WATSONX_AI_ENDPOINT,
    //   version: "2024-05-31",
    // }),
    tools: [],
  });

  const response = await agent.invoke({
    messages: deserialized,
  });

  return response.messages[response.messages.length - 1].content;
}
