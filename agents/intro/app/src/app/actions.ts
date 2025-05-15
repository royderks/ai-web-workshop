"use server";

import {
  mapStoredMessagesToChatMessages,
  StoredMessage,
} from "@langchain/core/messages";

export async function message(messages: StoredMessage[]) {
  const deserialized = mapStoredMessagesToChatMessages(messages);

  return 'Please implement the logic'
}
