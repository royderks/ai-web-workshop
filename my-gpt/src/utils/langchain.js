import { OpenAI } from "@langchain/openai";
import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";

export async function generateAnswer(question) {
    // const model = new WatsonxAI({
    //     modelId: "ibm/granite-13b-instruct-v2",
    //     ibmCloudApiKey: process.env.VITE_WATSONX_APIKEY,
    //     projectId: process.env.VITE_WATSONX_PROJECT_ID,
    //     modelParameters: {
    //         temperature: 0
    //     },
    // });
    const model = new OpenAI({
        openAIApiKey: process.env.VITE_OPENAI_APIKEY,
        model: "gpt-3.5-turbo-instruct",
        temperature: 0 // lower temperature = less deterministic
    });

    let answer = ''
    try {
        answer = await model.invoke(question);
    } catch (e) {
        return 'Something went wrong'
    }
    return answer
}