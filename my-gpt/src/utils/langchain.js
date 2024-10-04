import { ChatOpenAI } from "@langchain/openai";
import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";
import {
    PromptTemplate,
    FewShotPromptTemplate
} from "@langchain/core/prompts";
import z from 'zod'

export async function generateAnswer(question) {
    // const model = new WatsonxAI({
    //     modelId: "ibm/granite-13b-instruct-v2",
    //     ibmCloudApiKey: process.env.VITE_WATSONX_APIKEY,
    //     projectId: process.env.VITE_WATSONX_PROJECT_ID,
    //     modelParameters: {
    //         temperature: 0
    //     },
    // });

    const model = new ChatOpenAI({
        openAIApiKey: process.env.VITE_OPENAI_APIKEY,
        model: "gpt-4",
        temperature: 0 // lower temperature = less deterministic
    });

    const recommendations = z.object({
        title: z.string().describe("Name of the recommendation"),
        description: z.string().describe("Description in maximum 2 sentences"),
        age: z.number().optional().describe("Minimal age for the recommendation"),
    });

    const prompt = PromptTemplate.fromTemplate(
        "Be a helpful assistant and give a recommendation for the following activity: {question}"
    );

    const formattedPrompt = await prompt.format({
        question
    });

    let answer = ''
    try {
        const structuredLlm = model.withStructuredOutput(recommendations);
        const structuredAnswer = await structuredLlm.invoke(formattedPrompt);

        answer = JSON.stringify(structuredAnswer)
    } catch (e) {
        console.log({ e })
        return 'Something went wrong'
    }
    return answer
}