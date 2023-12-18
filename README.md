# AI For Frontend Workshop

![AI For Frontend demo](/assets/langchain-workshop.mov)

## Prerequisites

* OpenAI API Key. You can sign up for a [free trial](https://openai.com/signup).

## Installation

The application we'll be building today is using [Vite](https://vitejs.dev/), a build tool for modern JavaScript (and TypeScript) applications.

We need to set up the initial, bootstrapped application for this workshop. Run the following commands to set it up:

```bash
cd my-gpt
npm install
npm run dev
```

Go the link displayed in your terminal, you should be seeing the intial application.

The app will look something like:

![Initial Chat app](/assets/initial-chat-app.png)

You're now ready to start with the excercises.

## Excercises

### Excercise 1

To interface with the LLMs from OpenAI, we need to install a library called LangChain:

```bash
npm install langchain
```

After the installation is complete, you should add a new file called `.env` in the root of your Vite application and add the following environment variable:

```txt
VITE_OPENAI_KEY=sk-********
```

Next, we'll create a new file called `src/utils/langchain.ts` and add the following code:

<details open>
    <summary>src/utils/langchain.ts</summary>
  
    ```ts
    import { OpenAI } from "langchain/llms/openai";

    const llm = new OpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_KEY
    });
    ```
</details>

This will initialize a connection to OpenAI using LangChain and let us access the models. 

We'll create our first function that can be used to generate an answer for a question, add the following to the bottom of the file:

<details open>
    <summary>src/utils/langchain.ts</summary>
  
    ```ts
    export async function generateAnswer(question: string) {
        let answer = ''

        try {
            answer = await llm.predict(question);
        } catch (e) {
            return 'Something went wrong'
        }

        return answer
    }
    ```
</details>

To test if what we've done is working, create new file called `src/utils/langchain.test.ts` and write a test for the function `generateAnswer`.

Take the following code and modify it so the test will succeed:

<details open>
    <summary>src/utils/langchain.test.ts</summary>

    ```ts
    import { describe, it, assert } from 'vitest';
    import { generateAnswer } from './langchain';

    describe('LangChain', () => {
        it('Answers a question', async () => {
            // 1. Add your own question here
            const answer = await generateAnswer('YOUR QUESTION');

            // 2. Match the answer from the LLM to a predicted value
            assert.equal(answer.trim(), "THE ANSWER");
        });
    });
    ```
</details>

Run `npm run test` to run the above test. Make sure your test is succeeding.

### Excercise 2

We want to be able to use the messagebox in the application to send the question to the LLM and show the answer in the screen.

From our `App` component in `src/App.tsx`, we need to call the `generateAnswer` function we created in the previous excercise. First, let's create some state variables and import the function:

<details open>
    <summary>src/App.tsx</summary>

    ```ts
    import { useState } from "react";
    import { generateAnswer } from "./utils/langchain";

    export default function App() {
        const [question, setQuestion] = useState("")
        const [result, setResult] = useState({ question: "", answer: ""})

        // Everything else ...

    }
    ```
</details>

To call the `generateAnswer` function and add the question and answer to the state, you'll need to create a handler function. Add the following code to `src/App.tsx` and modify it so the state variable `result` contains both the question and answer. 

<details open>
    <summary>src/App.tsx</summary>

    ```ts
    // ...

    export default function App() {
        const [question, setQuestion] = useState("")
        const [result, setResult] = useState({ question: "", answer: ""})

        async function handleSubmitQuestion(input: string) {
            // 1. Store the question in state
            // 2. Call `generateAnswer` and store the answer in state
        }

        return (

            // Everything else...
        )
    }
    ```
</details>

Then, turn the `textarea` element into a controlled component that updates the `question` state variable whenever you type something. Also, the handler function we created above must be called when you submit the form.

<details open>
    <summary>src/App.tsx</summary>

    ```ts
    // ...

    // 1. Call the handler function when you submit the form
    <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
            <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
            // 2. Store the value of `textarea` in state when you type
                <textarea
                    value={question}
                    tabIndex={0}
                    data-id="root"
                    placeholder="Send a message..."
                    className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                ></textarea>
                <input type="submit"
                    className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-gray-500 right-1 md:right-2 disabled:opacity-40"
                    value="&#11157;"
                />
            </div>
        </div>
    </form>

    // ...

    ```
</details>

Submit the form and have a look at the *"Network tab"* in the browser, make sure you see a request to OpenAI that includes your question and resolves to an answer.

### Excercise 3

When you submit the form, you want to see the question and the answer displayed in the screen. Create a new component called `Message` in `src/components/Message/Message.tsx`, we'll use this component to render the question and the answer:

<details open>
    <summary>src/components/Message/Message.tsx</summary>

    ```ts
    type MessageProps = {
        sender: string
        title: string,
        message: string,
        timestamp?: string
    }

    export default function Message({ sender, title, message, timestamp = "" }: MessageProps) {
        return (
            <div className="flex items-start gap-2.5 mx-8 mb-4">
                <div className="w-8 h-8 rounded-full bg-red-300">
                    <span className="w-8 h-8 flex justify-center items-center">{sender}</span>
                </div>
                <div className="flex flex-col w-full leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
                        {timestamp && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{timestamp}</span>}
                    </div>
                    <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{message}</p>
                </div>
        </div>
        )
    }
    ```
</details>

Render this component from `src/App.tsx` so it shows the question and the answer. You can use a name like "Me" for the question, and "GPT (or "AI") for the answer:

<details open>
    <summary>src/App.tsx</summary>

    ```ts
    import { useState } from "react";
    import { generateAnswer } from "./utils/langchain";
    // 1. import `Message` component

    export default function App() {
        // ...

        return (
            // ...

            <div className="h-full ">
                  <div className="h-full flex flex-col items-center text-sm dark:bg-gray-800">
                      // 2. Render the Message component for the question and answer
                  </div>
              </div>
            
            // ...
        )
    }
    ```
</details>

When you complete this excercise you should be able to type a question, submit the form and see both the answer and question displayed on the screen.

### Excercise 4

The response from OpenAI might take some time to be delivered. That's why adding a loading indicator is a nice touch. You can use the following code block to create a new file called `src/components/Loader/Loader.tsx`:

<details open>
    <summary>src/components/Loader/Loader.tsx</summary>

    ```ts
    export default function Loader() {
        return (
            <div role="status">
                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        )
    }
    ```
</details>

You can use this component in `src/App.tsx` to show a loading indicator when you're waiting for the request to OpenAI to resolve.

BONUS: Also add an error state.

The application will now have both a way to ask questions and shows a loading state when the answer is being fetched from OpenAI.

### Excercise 5

The way you ask your question makes a huge difference in the response you're getting, maybe you've wondered why our answer is short and snappy rather than a blurb of text. [Prompt engineering](https://platform.openai.com/docs/guides/prompt-engineering) is a common way to change the format or style of the answer.

By giving the LLM a prompt template together with your question, you can control the format or sentiment of the answer. You don't always want to expose the prompt to the user of the application too.

Imagine we're building a GPT for a travel office, let's add the following prompt template:

```
Take the role of a personal travel assistant, and answer the following question in detail: {question}
```

Have a look at the [LangChainJS docs](https://js.langchain.com/docs/modules/model_io/prompts/prompt_templates/#what-is-a-prompt-template) to see how to implement a prompt template for the `generateAnswer` function in `src/utils/langchain.ts`.

Try out the impact of the prompt template on the answer from the LLM. Make sure to update the test case in `src/utils/langchain.test.ts` too.

### Excercise 6

The way you prompt the LLM isn't the only way to change the answer of the LLM, another thing we can do is changing the `temperature` or by using a different model.

You can modify these values in `src/utils/langchain.ts`:

<details open>
    <summary>src/utils/langchain.ts</summary>
  
    ```ts
    import { OpenAI } from "langchain/llms/openai";

    const llm = new OpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_KEY,
        temperature: 0.9, // Can be between 0 and 1
        modelName: "gpt-3.5-turbo-instruct", // Default. Other options: https://platform.openai.com/docs/models/
    });

    // Everything else ...

    ```
</details>

Play around with different values. How does this impact the quality or style of the answer?

### Excercise 7

The above is an example of a "zero shot" prompt. We didn't provide the LLM with any context besides what role to take. Therefore we assumed the LLM knows what a travel agent is, but sometimes the model has no information on your question or needs additional context.

We can also try "few shot prompting" where we give the LLM some examples before asking our question. Before implementing this type of prompting, we'll need to implement a chat model:

<details open>
    <summary>src/utils/langchain.ts</summary>

    ```ts
    import { ChatOpenAI } from "langchain/chat_models/openai";
    import { ChatPromptTemplate } from "langchain/prompts";

    const llm = new ChatOpenAI({
    openAIApiKey: import.meta.env.VITE_OPENAI_KEY
    });

    export async function generateAnswer(question: string) {
        let answer = ''

        const systemTemplate = "Take the role of a {role}, that answers questions in a {style} way.";
        const humanTemplate = "{text}";

        const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", systemTemplate],
            ["human", humanTemplate],
        ])

        const formattedChatPrompt = await chatPrompt.formatMessages({
            role: "personal travel agent",
            style: "detailed",
            text: question
        });
        
        try {
            const result = await llm.invoke(formattedChatPrompt);

            answer = result?.content as string

        } catch (e) {
            return 'Something went wrong'
        }

        return answer
    }
    ```
</detail>

In the above setup we made it easier to change the input variables, and by using a Chat model instead of LLM model we can start implementing different prompting techniques. You might see there's a `human` and `system` template, as in the Chat model subsequent messages are being used as context.

Fix your test so it will continue to run.

### Excercise 8

Let's start by adding a few shot prompting technique:

<details open>
    <summary>src/utils/langchain.ts</summary>

    ```ts
    import { ChatOpenAI } from "langchain/chat_models/openai";
    import { FewShotChatMessagePromptTemplate, ChatPromptTemplate } from "langchain/prompts";

    const llm = new ChatOpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_KEY
    });

    export async function generateAnswer(question: string) {
        let answer = ''

        const examples = [
            {
                input: "What are the best restaurants in Amsterdam?",
                output: "The highest rated restaurants in Amsterdam are (1), (2), (3)",
            },
            {
                input: "What is the best time of the year to visit The Netherlands?",
                output: "The best season for tourists to visit The Netherlands is the summer",
            },
        ];

        const examplePrompt = ChatPromptTemplate.fromTemplate(`Human: {input}
AI: {output}`);

        const fewShotPrompt = new FewShotChatMessagePromptTemplate({
            prefix:
            "Take the role of a personal travel agent, answer the question using the following examples",
            suffix: "Human: {input} AI:",
            examplePrompt,
            examples,
            inputVariables: ["input"],
        });

        const formattedChatPrompt = await fewShotPrompt.format({
            input: question,
        });
        
        try {
            const result = await llm.invoke(formattedChatPrompt);

            answer = result?.content as string

        } catch (e) {
            return 'Something went wrong'
        }

        return answer
    }
    ```
</details>

Ask a question like "What are the highlights in amsterdam?" and the response should match the format of the examples. Try for yourself, see the difference when you change the provided examples.

BONUS: Edit the application to allow follow-up questions by [passing the chat history](https://js.langchain.com/docs/modules/memory/how_to/summary#usage-with-an-llm).

### Excercise 9

Next to few-shot prompts or adding the chat history as context, you can also load data from external sources and pass it to the LLM.

In the directory `src/public` you can find a file called `data.txt` that contains a blog post about the best highlights in Amsterdam.

We don't want to pass the entire file to the LLM, as this can lead to overload when you have a lot of data. Instead, we need to take the most important parts of our data for whihch we would need a vector database.

We'll use a local in-memory vectorstore as this is a demo environment, by making these changes in `src/utils/langchain.ts`:

<details open>
    <summary>src/utils/langchain.ts</summary>

    ```ts
    // ...
    import { OpenAIEmbeddings } from "langchain/embeddings/openai";
    import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
    import { MemoryVectorStore } from "langchain/vectorstores/memory";

    const llm = new ChatOpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_KEY
    });

    let vectorStore: MemoryVectorStore;

    export async function generateAndStoreEmbeddings() {
        const trainingText = await fetch("/data.txt")
            .then((response) => response.text())
            .then((text) => text)

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
        });

        const docs = await textSplitter.createDocuments([trainingText]);

        vectorStore = await MemoryVectorStore.fromDocuments(
            docs,
            new OpenAIEmbeddings({ openAIApiKey: import.meta.env.VITE_OPENAI_KEY }),
        );
    }

    // Everything else ...
    ```
</details>

In `src/App.tsx` we need to load this data on the first render:

<details open>
    <summary>src/App.tsx</summary>

    ```ts
    // src/App.tsx
    import { useEffect, useState } from "react";
    import { generateAnswer, generateAndStoreEmbeddings } from "./utils/langchain";
    import Message from "./components/Message/Message";
    import Loader from "./components/Loader/Loader";

    export default function App() {
    const [question, setQuestion] = useState("")
    const [result, setResult] = useState({ question: "", answer: ""})
    const [loading, setLoading] = useState(false)

    // 1. Load data into vector store

    // Everything else ...

    }
    ```
</details>

The next step is to change the `generateAnswer` function to use the data stored in the vectorstore:

<details open>
    <summary>src/utils/langchain.ts</summary>

    ```ts
    // ...
    import { RetrievalQAChain, loadQARefineChain } from "langchain/chains";

    const llm = new ChatOpenAI({
    openAIApiKey: import.meta.env.VITE_OPENAI_KEY
    });

    let vectorStore: MemoryVectorStore;

    export async function generateAnswer(question: string) {
        const chain = new RetrievalQAChain({
            combineDocumentsChain: loadQARefineChain(llm),
            retriever: vectorStore.asRetriever(),
        });

        const result = await chain.call({
            query: question,
        });

        return result.output_text;
    }

    // Everything else ...

    ```
</details>

If you ask a question now, it will inject the data from the document. Try this out with multiple (follow-up) questions.

## Where to go from here

- Document Loaders
- RAG (Retrieval Augmented Generation)
- Agents


