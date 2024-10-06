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

export async function callWikipediaTool({ question }) {
    const tool = new WikipediaQueryRun({
        topKResults: 3,
        maxDocContentLength: 4000,
    });

    return await tool.invoke(question);
}

export async function generateAnswer(question) {
    const model = new WatsonxAI({
        modelId: "meta-llama/llama-3-2-3b-instruct",
        ibmCloudApiKey: process.env.VITE_WATSONX_APIKEY,
        projectId: process.env.VITE_WATSONX_PROJECT_ID,
        modelParameters: {
            max_new_tokens: 400
        }
    });

    // const model = new OpenAI({
    //     openAIApiKey: process.env.VITE_OPENAI_APIKEY,
    //     model: "gpt-3.5-turbo-instruct",
    // });

    const tools = [
        {
            name: "callWikipediaTool",
            description: "Retrieve information from wikipedia",
            function: ({ question }) => callWikipediaTool({ question }),
            parameters: [
                {
                    name: "question",
                    type: "string",
                    description: "The question passed by the user. It is used to fetch the specific details from the wikipedia database."
                }
            ]
        }
    ]

    const prompt = PromptTemplate.fromTemplate(`<|start_header_id|>system<|end_header_id|>
You are an expert in composing functions. You are given a question and a set of possible functions. 
Based on the question, you will need to make one or more function/tool calls to achieve the purpose. 
If none of the functions can be used, point it out. If the given question lacks the parameters required by the function,also point it out. You should only return the function call in tools call sections.
If you decide to invoke any of the function(s), you MUST put it in the format of [{{ "name": "func_name1", "parameters": {{ "params_name1": "params_value2", ... }} }}, ...]
You SHOULD NOT include any other text in the response.
Here is a list of functions in JSON format that you can invoke.

{tools}
<|eot_id|><|start_header_id|>user<|end_header_id|>
{question}
|eot_id|><|start_header_id|>assistant<|end_header_id|>
`);

    let answer = ''
    try {
        const formattedPrompt = await prompt.format({
            question,
            tools: JSON.stringify(tools)
        });

        answer = await model.invoke(formattedPrompt);

        // check if valid JSON
        if (answer && JSON.parse(answer)) {
            console.log('valid JSON', answer)

            // Call each of the suggested tools and combine the responses
            const toolResults = await Promise.all(JSON.parse(answer).map(async (tool) => {

                // Find the suggest tool from the list of tools, so we can use the function to retrieve the results
                const toolFromList = tools.find(({ name }) => name === tool.name)

                if (toolFromList) {
                    try {
                        // Call the tool to gather the result
                        return await toolFromList.function(tool.parameters)
                    } catch (e) {
                        console.log({ e })
                        return 'Something went wrong'
                    }
                }

                return null
            }))

            // Once we get tool results, we can use the LLM to come to a shorter answer
            if (toolResults) {
                try {
                    const prompt = PromptTemplate.fromTemplate(`Answer the question: {question}

Use the following information retrieved by a set of tool calls: {toolResults}.

Make the answer short and snappy.
                `);

                    const formattedPrompt = await prompt.format({
                        question,
                        toolResults: JSON.stringify(toolResults)
                    });

                    console.log('formattedPrompt #2', { formattedPrompt })

                    answer = await model.invoke(formattedPrompt);
                } catch (e) {
                    console.log({ e })
                    return 'Something went wrong'
                }
            }

            // TODO: Implement logic for when the tool call failed, or the input of the first tool calls should be used in the output of the second set of tool calls
        }

    } catch (e) {
        console.log({ e })
        return 'Something went wrong'
    }
    return answer
}