// import { OpenAI } from "@langchain/openai";
// const model = new OpenAI({
//     openAIApiKey: import.meta.env.VITE_OPENAI_APIKEY,
//     model: "gpt-3.5-turbo-instruct",
//     temperature: 0 // lower temperature = less deterministic
// });

import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";

const model = new WatsonxAI({
    modelId: "ibm/granite-13b-instruct-v2",
    ibmCloudApiKey: import.meta.env.VITE_WATSONX_APIKEY,
    projectId: import.meta.env.VITE_WATSONX_PROJECT_ID,
    modelParameters: {
        temperature: 0
    },
});

export async function generateAnswer(question: string) {
    let answer = ''
    try {
        answer = await model.invoke(question);
    } catch (e) {
        return 'Something went wrong'
    }
    return answer
}