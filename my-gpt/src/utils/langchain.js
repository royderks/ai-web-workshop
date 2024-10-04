import { OpenAI } from "@langchain/openai";
import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";
import {
    PromptTemplate,
    FewShotPromptTemplate
} from "@langchain/core/prompts";

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

    const examplePrompt = PromptTemplate.fromTemplate(
        "Question: {question}\n\nAnswer: {answer}"
    );

    const examples = [
        {
            question: "What are the best museums in Amsterdam?",
            answer: "The highest rated museums in Amsterdam are: Rijksmuseum, Van Gogh Museum, Anne Frank Huis",
        },
        {
            question: "What is the best time of the year to visit The Netherlands?",
            answer: "The best time of the year to visit The Netherlands is: summer",
        },
        {
            question: "How would you recommend to travel in The Netherlands?",
            answer: "The recommended means of transportation in The Netherlands are: bike, boat, train",
        },
    ];

    const prompt = new FewShotPromptTemplate({
        examples,
        examplePrompt,
        suffix: "Question: {question}\n\n",
        inputVariables: ["question"],
    });

    const formattedPrompt = await prompt.format({
        question
    });

    let answer = ''
    try {
        answer = await model.invoke(formattedPrompt);
    } catch (e) {
        return 'Something went wrong'
    }
    return answer
}