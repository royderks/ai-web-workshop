# AI For Web Developers Workshop

![AI For Web Developers demo](/assets/chat-app-document-loader.png)

## Prerequisites

You need to have an API Key for either OpenAI or IBM watsonx.ai. To get your API Key:

- **OpenAI API**: You can sign up for a [free trial](https://platform.openai.com/) ($5 credit), press "Login" in top-right and follow the instructions.
- **IBM watsonx**: You can sign up for a [free trial](https://www.ibm.com/products/watsonx-ai) (25,000 free tokens), press "Start your free trial" and follow the instructions to create an IBM ID & IBM Cloud account. Use the region Dallas (`us-south`) when prompted.

## Get your credentials

- **OpenAI API**:
    - After signing up, first check [here](https://platform.openai.com/settings/organization/billing/overview) if you have gotten the free credits. **If you did not get the free credits, you have to add your creditcard information**.
    - Open the [API Keys page](https://platform.openai.com/api-keys) and create a new API Key. Store the API Key somewhere safe as you need it later.
- **IBM watsonx**:
    - After signing up, wait for your sandbox to complete setting up. 
    - Once the sandbox has loaded, open it and click the "Manage" tab. Copy the project ID from the "Details" section of the "General" page. 
    - To get your API Key, open the hamburger menu in the top-left and select "Access (IAM)". This will open the IBM Cloud Console, in the menu you have to select ["API Keys"](https://cloud.ibm.com/iam/apikeys) and create a new API Key.
    - Store both the project ID and API Key somewhere safe as you need it later.

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

To interface with the LLMs, we need to install a library called LangChain:

```bash
npm install langchain @langchain/openai

# Or for watsonx
npm install langchain @langchain/community
```

After the installation is complete, you should add a new file called `.env` in the root of your Vite application and add the following environment variable:

```bash
VITE_OPENAI_APIKEY=sk-********

# Or for watsonx
VITE_WATSONX_PROJECT_ID=
VITE_WATSONX_APIKEY=
```

Next, we'll create a new file called `src/utils/langchain.js` and add the following code:

<details open>
    <summary>src/utils/langchain.js</summary>
  
```js
import { OpenAI } from "@langchain/openai";
// Or for watsonx
import { WatsonxAI } from "@langchain/community/llms/watsonx_ai";

export async function generateAnswer(question) {
    const model = new OpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_APIKEY,
        model: "gpt-3.5-turbo-instruct", 
        temperature: 0 // lower temperature = less deterministic
    });

    // Or for watsonx
    const model = new WatsonxAI({
        modelId: "ibm/granite-13b-instruct-v2",
        ibmCloudApiKey: import.meta.env.VITE_WATSONX_APIKEY,
        projectId: import.meta.env.VITE_WATSONX_PROJECT_ID,
        modelParameters: {
            temperature: 0
        },
    });
}
```

</details>

This will initialize a connection to the LLM Provider using LangChain and let us access the models. See here for all the supported models and their IDs:

- [OpenAI](https://platform.openai.com/docs/models)
- [IBM watsonx](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-api-model-ids.html?context=wx&audience=wdp)

We'll create our first function that can be used to generate an answer for a question, add the following to the bottom of the file:

<details open>
    <summary>src/utils/langchain.js</summary>

```js
export async function generateAnswer(question) {
    // const model = ...

    let answer = '';

    try {
        answer = await model.invoke(question);
    } catch (e) {
        return 'Something went wrong';
    }

    return answer;
}
```

</details>

To test if what we've done is working, create new file called `src/utils/langchain.test.js` and write a test for the function `generateAnswer`.

Take the following code and modify it so the test will succeed:

<details open>
    <summary>src/utils/langchain.test.js</summary>

```js
import { describe, it, assert } from 'vitest';
import { generateAnswer } from './langchain';

describe('LangChain', () => {
    it('Answers a question', async () => {
        // 1. Add your own question here
        const answer = await generateAnswer('Is the United Kingdom a country, answer "yes" or "no" only.');

        console.log({ answer })

        // 2. Match the answer from the LLM to a predicted value
        assert.equal(answer.trim().toLowerCase(), "yes");
    });
});
```

</details>

Run `npm run test` to run the above test. You can change the question and the answer to test a different reponse.

Hint: Be explicit of what you expect the LLM to return.

### Excercise 2

To avoid leaking the credentials to the user, we need to set up a server-side request. The application has already been set up to support this. In the file `server.js` add the following:

<details open>
    <summary>server.js</summary>

```js
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add this part
app.post("/message", async (req, res, next) => {
  try {
    const { question } = req?.body
    const answer = await generateAnswer(question)

    res.json({ answer })
  } catch (e) { 
    next(e) 
  }
});
```

</details>

Start the application by running `npm run dev` in the terminal. The application will start, and is availabe at `http://localhost:3000` and `http://localhost:3000/message` for the API.

Can you send a request `http://localhost:3000/message` using cURL, Postman or any other tool you use for testing API requests? 

Hint: The API has the method `POST` and expects JSON with a body containing the field `question`.

<details>
    <summary>cURL solution</summary>

```bash
curl -XPOST -H "Content-type: application/json" -d '{ "question": "What is the capital of the UK" }' 'http://localhost:3000/message'
```

</details>

### Excercise 3

We want to be able to use the messagebox in the application to send the question to the LLM and show the answer in the screen.

First, create a new component called `src/components/Message.jsx` that we'll use to display the messages:

<details open>
    <summary>src/components/Message.jsx</summary>

```js
export default function Message({ role, content }) {

    return (
        <div className="flex items-start gap-2.5 mx-8 mb-4">
            <div className="z-10 w-8 h-8 rounded-full bg-red-300">
                <span className="w-8 h-8 flex justify-center items-center">{role}</span>
            </div>
            <div className="flex flex-col w-full leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{content}</p>
            </div>
        </div>
    );
}
```

From our `App` component in `src/App.js`, we can import this component and make the existing function `handleSubmitQuestion` work with the API we created in excercise 2:

<details open>
    <summary>src/App.js</summary>

```js
import { useState } from "react";
import Message from "./components/Message";

export default function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([])

  async function handleSubmitQuestion(input) {
    try {
        // 1. Call `/message` 
        // 2. Store the answer in state in below format
        // setMessages([
        //   { role: "user", content: "question" },
        //   { role: "assistant", content: "answer" }
        // ])
      }
    } catch (e) {
      console.error(e)
    }
  }

  // ...
```

</details>

Submit the form and have a look at the _"Network tab"_ in the browser, make sure you see a request to the endpoint `/message` that includes your question and resolves to an answer.

Once you confirmed it renders, we want to display the question and the answer on the screen. You already created a new component called `Message` in `src/components/Message.jsx`, we'll use this component to render the question and the answer:

<details open>
    <summary>src/App.tsx</summary>

```ts
// ...

export default function App() {
    // ...

    return (
        // ...

        <div className="h-4/5 overflow-auto">
              <div className="h-full flex flex-col items-center text-sm dark:bg-gray-800">
                  // 2. Using the `messages` state variable, render the Message component for the question and answer
              </div>
          </div>

        // ...
    );
}
```

</details>

When you complete this excercise you should be able to type a question, submit the form and see both the answer and question displayed on the screen.

### Excercise 4

The response from the LLM might take some time to be delivered. That's why adding a loading indicator is a nice touch. You can use the following code block to create a new file called `src/components/Loader.jsx`:

<details open>
    <summary>src/components/Loader.jsx</summary>

```js
export default function Loader() {
    return (
        <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
    );
}
```

</details>

You can use this component in `src/App.jsx` to show a loading indicator when you're waiting for the request to the LLM to resolve.

BONUS: Also add an error state.

The application will now have both a way to ask questions and shows a loading state when the answer is being fetched from the LLM.

### Excercise 5

The way you ask your question makes a huge difference in the response you're getting, maybe you've wondered why our answer is short and snappy rather than a blurb of text. [Prompt engineering](https://www.promptingguide.ai/) is a common way to change the format or style of the answer.

By giving the LLM a prompt template together with your question, you can control the format or sentiment of the answer. You don't always want to expose the prompt to the user of the application too.

Imagine we're building a GPT for a travel office, let's add the following prompt template:

```
Take the role of a personal travel assistant, and answer the following question in detail: {question}
```

Have a look at the [LangChainJS docs](https://js.langchain.com/docs/concepts/#string-prompttemplates) to see how to implement a standard prompt template for the `generateAnswer` function in `src/utils/langchain.js`.

First, we'll implement a prompt template with a variable substitution. For this you should import the following method:

```js
import { PromptTemplate } from "@langchain/core/prompts";
```

Then add your prompt template:

<details open>
    <summary>src/utils/langchain.js</summary>
  
```js
export async function generateAnswer(question) {
    // const model = ...

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
}
```
</details>

Try out the impact of the prompt template on the answer from the LLM. Make sure to update the test case in `src/utils/langchain.test.js` too.

Hint: How can you overwrite the prompt instruction in the test case too without mocking?

Hint: The way you prompt the LLM isn't the only way to change the answer of the LLM, another thing we can do is changing the model parameters or by using a different model.

You can modify these values in `src/utils/langchain.js`:

<details open>
    <summary>src/utils/langchain.js</summary>
  
```js
export async function generateAnswer(question) {
    const model = new OpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_APIKEY,
        model: "gpt-3.5-turbo-instruct", // For other models https://platform.openai.com/docs/models
        temperature: 0.7,
        maxTokens: 1000,
        maxRetries: 5,
        // see https://v03.api.js.langchain.com/classes/_langchain_openai.OpenAI.html for all model parameters
    });

    // Or for watsonx
    const model = new WatsonxAI({
        modelId: "ibm/granite-13b-instruct-v2", // For other models https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-api-model-ids.html?context=wx&audience=wdp
        ibmCloudApiKey: import.meta.env.VITE_WATSONX_APIKEY,
        projectId: import.meta.env.VITE_WATSONX_PROJECT_ID,
        modelParameters: {
            max_new_tokens: 100,
            min_new_tokens: 0,
            stop_sequences: [],
            repetition_penalty: 1,
        },
    });
}
```
</details>

Play around with different values, either from the application or by writing different test cases. How does this impact the quality or style of the answer?

### Excercise 7

The above is an example of a "zero shot" prompt. We didn't provide the LLM with any context besides what role to take. Therefore we assumed the LLM knows what a travel agent is, but sometimes the model has no information on your question or needs additional context.

Before implementing a new type of prompting, we'll need to implement a chat model:

<details>
    <summary>src/utils/langchain.ts</summary>

    ```ts
    import { ChatOpenAI } from "@langchain/openai";
    import { ChatPromptTemplate } from "@langchain/core/prompts";

    const llm = new ChatOpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_KEY,
        temperature: 1,
        modelName: "gpt-4-0125-preview",
    });

    export async function generateAnswer(
        question: string,
        promptTemplate: string = "Take the role of a {role}, that answers questions in a {style} way.",
        role: string = "Personal travel assistant",
        style: string = "consistent" // What happens if you change this to detailed?
    ) {
        let answer = ''

        const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", promptTemplate],
            ["human", "{question}"],
        ]);

        const formattedPrompt = await chatPrompt.formatMessages({
            role,
            style,
            question
        });

        try {
            const result = await llm.invoke(formattedPrompt);
            answer = result?.content as string;
        } catch (e) {
            return 'Something went wrong';
        }

        return answer;
    }

    ```

</details>

In the above setup we made it easier to change the input variables, and by using a Chat model instead of LLM model we can start implementing different prompting techniques. You might see there's a `human` and `system` template, as in the Chat model subsequent messages are being used as context.

Fix your test so it will continue to run.

### Excercise 8

We can also try "few shot prompting" where we give the LLM some examples before asking our question, try [this example in the OpenAI playground](https://platform.openai.com/playground/p/WqBsOKw0bvEae65ajSQPLRfv?model=gpt-3.5-turbo&mode=chat).

Let's start by adding a few shot prompting technique:

<details>
    <summary>src/utils/langchain.ts</summary>

```ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, FewShotChatMessagePromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({
    openAIApiKey: import.meta.env.VITE_OPENAI_KEY,
    temperature: 1,
    modelName: "gpt-4-0125-preview",
});

export async function generateAnswer(
    question: string,
    promptTemplate: string = "Take the role of a Personal travel assistant, that answers questions in a consistent way."
) {
    let answer = '';

    const examples = [
        {
            input: "What are the best restaurants in Amsterdam?",
            output: "The highest rated restaurants in Amsterdam are (1), (2), (3)",
        },
        {
            input: "What is the best time of the year to visit The Netherlands?",
            output: "Summer",
        },
    ];

    const examplePrompt = ChatPromptTemplate.fromTemplate(`User: {input}
Assistant: {output}`);

    const fewShotPrompt = new FewShotChatMessagePromptTemplate({
        prefix: promptTemplate,
        suffix: "User: {input} Assistant:",
        examplePrompt,
        examples,
        inputVariables: ["input"],
    });

    const formattedPrompt = await fewShotPrompt.format({
        input: question,
    });

    try {
        const result = await llm.invoke(formattedPrompt);
        answer = result?.content as string;
    } catch (e) {
        console.log(e);
        return 'Something went wrong';
    }

    return answer;
}
```

</details>

Ask a question like "What are the best museums in amsterdam?" and the response should match the format of the examples. Try for yourself, see the difference when you change the provided examples.

BONUS: Edit the application to allow follow-up questions by [passing the chat history](https://js.langchain.com/docs/modules/memory/how_to/summary#usage-with-an-llm).

BONUS: You can also implement few shot prompting without using chat, for this you can use [prompt pipelines](https://js.langchain.com/docs/modules/model_io/prompts/pipeline).

### Excercise 9

Next to few-shot prompts or adding the chat history as context, you can also load data from external sources and pass it to the LLM.

In the directory `src/public` you can find a file called `data.txt` that contains a blog post about the best highlights in Amsterdam.

We don't want to pass the entire file to the LLM, as this can lead to overload when you have a lot of data. Instead, we need to take the most important parts of our data for whihch we would need a vector database.

We'll use a local in-memory vectorstore as this is a demo environment, by making these changes in `src/utils/langchain.ts`:

<details open>
    <summary>src/utils/langchain.ts</summary>

```ts
// ...
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate, FewShotChatMessagePromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// ...

let vectorStore: MemoryVectorStore;

export async function generateAndStoreEmbeddings() {
    const trainingText = await fetch("/data.txt")
        .then((response) => response.text())
        .then((text) => text);

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
    const [question, setQuestion] = useState("");
    const [result, setResult] = useState({ question: "", answer: "" });
    const [loading, setLoading] = useState(false);

    // 1. Load data into vector store

    // Everything else ...

}
```

</details>

The next step is to create a new function for the `generateAnswer` function to use the data stored in the vectorstore:

<details open>
    <summary>src/utils/langchain.ts</summary>

```ts
// ...
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

// ...

export async function generateAnswerRAG(question: string) {
    let answer = '';

    const prompt = ChatPromptTemplate.fromTemplate(`
Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}`
    );

    const documentChain = await createStuffDocumentsChain({
        llm,
        prompt,
    });

    const retriever = vectorStore.asRetriever();

    const retrievalChain = await createRetrievalChain({
        combineDocsChain: documentChain,
        retriever,
    });

    try {
        const result = await retrievalChain.invoke({
            input: question,
        });
        answer = result?.answer;
    } catch (e) {
        console.log(e);
        return 'Something went wrong';
    }

    return answer;
}
```

</details>

And finally, use this new function in `src/App.tsx`.

If you ask a question now, it will inject the data from the document. Try this out with multiple (follow-up) questions.

BONUS: Add the prompt template for few shot prompting back into this new function.

## Where to go from here

- Document Loaders
- RAG (Retrieval Augmented Generation)
- Agents
