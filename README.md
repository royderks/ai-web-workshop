


https://blog.logrocket.com/getting-started-langchain-js/#web-loaders




Requirements

- OpenAI API Key






Vite app


```
npm create vite@latest
```

Select:

```
✔ Project name: … my-gpt
✔ Select a framework: › React
✔ Select a variant: › TypeScript
```

Then:

```
cd chat-app
npm install
npm run dev
```

The link to the app will be in your terminal, and the app looks like this.

![Initial Vite app](/assets/initial-vite-app.png)


Adding Tailwind


https://tailwindcss.com/docs/guides/vite

```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add the paths to all of your template files in your `tailwind.config.js` file.

```
/** tailwind.config.js */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

```

Delete the contents of `src/index.css` and replace with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Also, delete the following files

```
assets/react.svg
public/vite.svg
src/App.css
```

And in the file `src/App.tsx` replace the contents with:

```
export default function App() {
  return (
    <main className="overflow-hidden w-full h-screen relative flex">
    <div className="flex max-w-full flex-1 flex-col">
      <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
        <div className="flex-1 overflow-hidden dark:bg-gray-800">
            <h1 className="text-2xl sm:text-4xl font-semibold text-center text-gray-200 dark:text-gray-600 flex gap-4 p-4 items-center justify-center">
              My GPT
            </h1>
          <div className="h-full ">
            <div className="h-full flex flex-col items-center text-sm dark:bg-gray-800">
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
          <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
            <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
              <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                <textarea
                  value=""
                  tabIndex={0}
                  data-id="root"
                  placeholder="Send a message..."
                  className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                ></textarea>
                <button
                  className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-gray-500 right-1 md:right-2 disabled:opacity-40"
                >
                  &#11157;
                </button>
              </div>
            </div>
          </form>
          <div className="px-3 pt-2 pb-3 text-center text-xs text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
            <span>
              The responses may include inaccurate information about people, places, or facts.
            </span>
          </div>
        </div>
      </div>
    </div>
    </main>
  );
};
```

The app will look something like:

![Initial Chat app](/assets/initial-chat-app.png)


## Let's add LangChain

```
npm install -S langchain
```

Create a new file called `.env` and add your OpenAI API Key:

```
VITE_OPENAI__KEY=sk-********
```


We'll create a new file called `src/utils/langchain.ts` with the following:

```ts
// src/utils/langchain.ts
import { OpenAI } from "langchain/llms/openai";

const llm = new OpenAI({
  openAIApiKey: import.meta.env.VITE_OPENAI_KEY
});
```

this will initialize OpenAI and let us access the models. We'll create our first function that can be used to generate an answer for a question


```ts
// src/utils/langchain.ts
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

It uses the `predict` method of `llm`.

From our App component, we can invoke this function. First, let's create some state variables and import the newly create function:

```ts
// src/App.tsx
import { useState } from "react";
import { generateAnswer } from "./utils/langchain";

export default function App() {
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState({ question: "", answer: ""})

  // Everything else ...

}
```

Then, we create a handler function that can submit a question:

```ts
// src/App.tsx
// ...

export default function App() {
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState({ question: "", answer: ""})

  async function handleSubmitQuestion(input: string) {
    setResult({
        question: input,
        answer: ""
    })

    try {
      const generatedAnswer = await generateAnswer(input)

      if (generatedAnswer) {
        setResult({
          question: input,
          answer: generatedAnswer})
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (

    // Everything else...
  )
}
```

To submit the quesiton, we need to alter the `form` element down below and make the `textarea` element controlled by the React state:

```ts
// ...

export default function App() {
    // ...

    return (
        return (
          // ...

          <form 
            className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmitQuestion(question)
            }}
          >
            <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
              <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                <textarea
                  value={question}
                  tabIndex={0}
                  data-id="root"
                  placeholder="Send a message..."
                  className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                  onChange={(e) => setQuestion(e.target.value)}
                ></textarea>
                <input type="submit"
                  className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-gray-500 right-1 md:right-2 disabled:opacity-40"
                  value="&#11157;"
                />
              </div>
            </div>
          </form>
        
          // ...
  );
};
```

The `onSubmit` function will take the React state variable `question` and passed it to the handler function. The variable `question` will be updated whenever you type in the `textarea` element.

When the function `handleSubmitQuestion` gets an answer back from OpenAI it will add the answer to the state variable `result`. This variable will contain both the question and the answer. To render this answer we need to make the following change:

```tsx
// src/App.tsx
// ...

return (
    return (
    <main className="overflow-hidden w-full h-screen relative flex">
    <div className="flex max-w-full flex-1 flex-col">
      <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
        <div className="flex-1 overflow-hidden dark:bg-gray-800">
            <h1 className="text-2xl sm:text-4xl font-semibold text-center text-gray-200 dark:text-gray-600 flex gap-4 p-4 items-center justify-center">
              My GPT
            </h1>
          <div className="h-full ">
            <div className="h-full flex flex-col items-center text-sm dark:bg-gray-800">
              {result?.question && <div className="flex items-start gap-2.5 mx-8 my-2">
                <div className="w-8 h-8 rounded-full bg-blue-300">
                  <span className="w-8 h-8 flex justify-center items-center">ME</span>
                </div>
                <div className="flex flex-col w-full leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Question</span>
                    </div>
                    <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{result.question}</p>
                </div>
              </div>}

              {result?.answer && <div className="flex items-start gap-2.5 mx-8 my-2">
                <div className="w-8 h-8 rounded-full bg-red-300">
                  <span className="w-8 h-8 flex justify-center items-center">GPT</span>
                </div>
                <div className="flex flex-col w-full leading-1.5 p-4 border-gray-300 bg-gray-200 rounded-e-xl rounded-es-xl dark:bg-gray-500">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Answer</span>
                    </div>
                    <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{result.answer}</p>
                </div>
              </div>}
            </div>
          </div>
        </div>

        // ...
)

```

This will render both the question and the answer in a text bubble, so for example, the question "what is the capital of The Netherlands?" will return "Amsterdam".

![Chat app with simple question and answer](/assets/chat-app-simple-question.png)

Also, we can clean up our `App` component by creating seperate components for the chat bubbles. Create a new file called `src/components/Message/Message.tsx` and add the following:

```tsx
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

In the `App` component we need to import this component:

```
import { useState } from "react";
import { generateAnswer } from "./utils/langchain";
import Message from "./components/Message/Message";

export default function App() {
    // Everything else...
}
```

And render it for both the question and the answer:

```
// src/App.tsx
// ...

return (
    // ...
    <div className="h-full ">
        <div className="h-full flex flex-col items-center text-sm dark:bg-gray-800">
            {result?.question && <Message sender="ME" title="Question" message={result.question} />}
            {result?.answer && <Message sender="GPT" title="Answer" message={result.answer} />}
        </div>
    </div>
)

// ...


```

Awesome. As a final touch we can differentiate between the question and answer by passing two new props `avatarColor`:

```
// src/App.tsx
// ...

return (
    // ...
    <div className="h-full ">
        <div className="h-full flex flex-col items-center text-sm dark:bg-gray-800">
              {result?.question && <Message sender="ME" title="Question" message={result.question} avatarColor="bg-blue-200" />}
              {result?.answer && <Message sender="GPT" title="Answer" message={result.answer} avatarColor="bg-red-200" />}
        </div>
    </div>
)

// ...

BONUS: Let's add some additional goodies and display the question as soon as it here, and add some loading state for the short wait for OpenAI to return the answer.

Create a new component called `src/Loader/Loader.tsx` and add the following:

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

In `src/App.tsx` we'll add some loading state and add the `Loader` component:

```ts
// src/App.tsx
import { useState } from "react";
import { generateAnswer } from "./utils/langchain";
import Message from "./components/Message/Message";
import Loader from "./components/Loader/Loader";

export default function App() {
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState({ question: "", answer: ""})
  const [loading, setLoading] = useState(false)

  // ...

}
```

And, of course, render the loading state component:

```ts
// src/App.tsx
// ...

return (
    <main className="overflow-hidden w-full h-screen relative flex">
    <div className="flex max-w-full flex-1 flex-col">
      <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
        <div className="flex-1 overflow-hidden dark:bg-gray-800">
            <h1 className="text-2xl sm:text-4xl font-semibold text-center text-gray-200 dark:text-gray-600 flex gap-4 p-4 items-center justify-center">
              My GPT
            </h1>
          <div className="h-full ">
            <div className="h-full flex flex-col items-center text-sm dark:bg-gray-800">
              {result?.question && <Message sender="ME" title="Question" message={result.question} avatarColor="bg-blue-200" />}
              {loading && <Loader />}
              {result?.answer && <Message sender="GPT" title="Answer" message={result.answer} avatarColor="bg-red-200" />}
            </div>
          </div>
        </div>
    
        // Everything else...
)
```

The application will now have both a way to ask questions and shows a loading state when the answer is being fetched from OpenAI.

![Interactive question and answer chat app](/assets/chat-app-simple-question-interactive.mov)


Prompt engineering

https://platform.openai.com/docs/guides/prompt-engineering

The way you ask your question makes a huge difference in the response you're getting, maybe you've wondered why out answer is short and snappy rather than a blurb of text. By giving the LLM a prompt template together with your question, you can control the format or sentiment of the answer. You don't always want to expose the prompt to the user of the application too.

Imagine we're building a GPT for a travel office, let's add prompt template:

```ts
// src/utils/langchain.ts
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

// ...

export async function generateAnswer(question: string) {
  let answer = ''

  const prompt = PromptTemplate.fromTemplate(
    "Take the role of a personal travel assistant, and answer the following question in detail: {question}?"
  );

  const formattedPrompt = await prompt.format({
    question
  });
  
  try {
    answer = await llm.predict(formattedPrompt);
  } catch (e) {
    return 'Something went wrong'
  }

  return answer
}
```

The above is an example of a "zero shot" prompt. We didn't provide the LLM with any context besides what role to take. Therefore we assumed the LLM knows what a travel agent is.

> what are the highlights of the Netherlands?

We can also try "few shot prompting" where we give the LLM some examples before asking our question. Before implementing this type of prompting, we'll implement a chat model.


## Chat model

To use a chat model, we need to make some changes to `src/utils/langchain.ts`:


```
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
    role: "travel",
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

In the above setup we made it easier to change the input variables, and by using a chat model instead of LLM model we can start implementing different prompting techniques.

Let's start by adding a few shot prompting technique:

```ts
// src/utils/langchain.ts
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

Ask a question like "What are the highlights in amsterdam?" and the response should match the format of the examples. Try for yourself.

BONUS: Edit the application to allow follow-up questions by passing the chat history.
https://js.langchain.com/docs/modules/memory/how_to/summary#usage-with-an-llm


## Data Loaders

First, create a document by moving the file `data.txt` from the root of the repo to the directory `public`.

Then, we need to load the data into a vectorstore. We'll use a local in-memory vectorstore as this is a demo environment

```ts
// src/utils/langchain.ts
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
```

In `src/App.tsx` we need to load this data on the first render:

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

  useEffect(() => {
    generateAndStoreEmbeddings()
  }, [])

  // Everything else ...

}
```

The next step is to change the `generateAnswer` function to use the data stored in the vectorstore:

```ts
// src/utils/langchain.ts
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

If you ask a question now, it will inject the data from the document:

![Chat app with document loader](/assets/chat-app-document-loader.png)

## Where to go from here

- Document Loaders
- RAG (Retrieval Augmented Generation)
- Agents





