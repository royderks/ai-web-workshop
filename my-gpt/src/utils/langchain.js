import { OpenAI } from "@langchain/openai";
import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";
import { PromptTemplate } from "@langchain/core/prompts";

import "@tensorflow/tfjs-node-gpu";
import { TensorFlowEmbeddings } from "@langchain/community/embeddings/tensorflow";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import fs from 'fs'

import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

export async function generateAndStoreEmbeddings() {
    let vectorStore = ''

    const file = fs.readFileSync(process.cwd() + '/src/public/data.txt', 'binary');

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 100,
    });

    const docs = await textSplitter.createDocuments([file]);

    vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        new TensorFlowEmbeddings()
    );

    return vectorStore
}

export async function callWikipediaTool(question) {
    const tool = new WikipediaQueryRun({
        topKResults: 3,
        maxDocContentLength: 4000,
    });

    return await tool.invoke(question);
}

export async function generateAnswer(question) {
    const model = new WatsonxAI({
        modelId: "ibm/granite-13b-instruct-v2",
        ibmCloudApiKey: process.env.VITE_WATSONX_APIKEY,
        projectId: process.env.VITE_WATSONX_PROJECT_ID,
    });

    // const model = new OpenAI({
    //     openAIApiKey: process.env.VITE_OPENAI_APIKEY,
    //     model: "gpt-3.5-turbo-instruct",
    // });

    const prompt = PromptTemplate.fromTemplate(` Use the following pieces of context to answer the question at the end.
If you can't find the answer in the provided context, just say that you cannot answer the question based on the provided context, 
don't answer based on your training data or hallucinate.

{context}

Question: {question}

Helpful Answer:`);

    let answer = ''
    try {
        const context = await callWikipediaTool(question);
        const formattedPrompt = await prompt.format({
            context,
            question
        });

        answer = await model.invoke(formattedPrompt);

    } catch (e) {
        console.log({ e })
        return 'Something went wrong'
    }
    return answer
}