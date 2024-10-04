import { OpenAI } from "@langchain/openai";
import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";
import { PromptTemplate } from "@langchain/core/prompts";

export async function generateAnswer(question) {
    const model = new WatsonxAI({
        modelId: "ibm/granite-13b-instruct-v2",
        ibmCloudApiKey: process.env.VITE_WATSONX_APIKEY,
        projectId: process.env.VITE_WATSONX_PROJECT_ID,
        modelParameters: {
            temperature: 0
        },
    });
    // const model = new OpenAI({
    //     openAIApiKey: process.env.VITE_OPENAI_APIKEY,
    //     model: "gpt-3.5-turbo-instruct",
    //     temperature: 0 // lower temperature = less deterministic
    // });

    const promptTemplate = PromptTemplate.fromTemplate(
        "Take the role of a personal travel assistant, and answer the following question in detail: {question}"
    );

    const formattedPrompt = await promptTemplate.invoke({ question });

    let answer = ''
    try {
        answer = await model.invoke(formattedPrompt);
    } catch (e) {
        return 'Something went wrong'
    }
    return answer
}