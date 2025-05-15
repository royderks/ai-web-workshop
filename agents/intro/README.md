# AI For Web Developers | Agents Workshop - Introduction

## Prerequisites

You need access to a Large Language Model to follow along with this workshop. I recommend using IBM watsonx (cloud, 300k token free trial), OpenAI (cloud, no free trial) or Ollama (local) to access models.

- **IBM watsonx**: You can sign up for a [free trial](https://www.ibm.com/products/watsonx-ai) (300,000 free tokens), press "Start your free trial" and follow the instructions to create an IBM ID & IBM Cloud account. Use the region Dallas (`us-south`) when prompted.
- **OpenAI API**: You can sign up for a [free trial](https://platform.openai.com/) ($5 credit), press "Login" in top-right and follow the instructions.
- **Ollama**: You can download [Ollama](https://ollama.com/download) and run a LLM locally on your machine. Depending on the specs of your machine it can be slow or too heavy to install. After downloading Ollama, make sure to use the CLI command (`ollama run llama3.2` or ) to download the model (+/- 5GB) to your machine. **depending on your computer specs this might be slow and inefficient**.

When using IBM watsonx.ai or OpenAI you need to have an API Key. To get your API Key:

- **IBM watsonx**:
    - After signing up, wait for your sandbox to complete setting up. 
    - Once the sandbox has loaded, open it and click the "Manage" tab. Copy the project ID from the "Details" section of the "General" page. 
    - To get your API Key, open the hamburger menu in the top-left and select "Access (IAM)". This will open the IBM Cloud Console, in the menu you have to select ["API Keys"](https://cloud.ibm.com/iam/apikeys) and create a new API Key.
    - Store both the project ID and API Key somewhere safe as you need it later.
- **OpenAI API**:
    - After signing up, first check [here](https://platform.openai.com/settings/organization/billing/overview) if you have gotten the free credits. **If you did not get the free credits, you have to add your creditcard information**.
    - Open the [API Keys page](https://platform.openai.com/api-keys) and create a new API Key. Store the API Key somewhere safe as you need it later.

## Installation

The application we'll be building today is using [Vite](https://vitejs.dev/), a build tool for modern JavaScript (and TypeScript) applications.

We need to set up the initial, bootstrapped application for this workshop. Run the following commands to set it up:

```bash
cd app
npm install
npm run dev
```

Go the link displayed in your terminal, you should be seeing the intial application.

The app will look something like:

![Initial Chat app](/assets/initial-chat-app.png)

You're now ready to start with the excercises.

## Excercises

### Excercise 1 - Connect to a LLM

To interface with the LLMs, we need to install a library called LangChain:

```bash
npm install langchain @langchain/core @langchain/ollama

# Or for OpenAI
npm install langchain @langchain/core @langchain/openai

# Or for watsonx
npm install langchain @langchain/core @langchain/community
```

After the installation is complete, you should add a new file called `.env` in the root of your Vite application and add the following environment variable:

```bash
VITE_OPENAI_APIKEY=sk-********

# Or for OpenAI
VITE_=

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

### Excercise 2 - Create a tool

Agents need tools in order to work with realtime data or to connect to external libaries. Create a basic tool that takes one parameter in `src/app/actions.ts`. The tool will need a "tool definition" consisting of a name, description and input schema.

<details open>
    <summary>server.js</summary>

```js

```

</details>

### Excercise 3 - Connect to a data source

The "basic" tool that's we just created in `src/app/actions.ts` is just a placeholder, instead we want a tool that connects to the internet. LangChain has a set of [community tools](https://js.langchain.com/docs/integrations/tools/) that you can use, such as a tool to retrieve information from Wikipedia.

First, import the tool into the `src/langchain.js` file:

```js
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
```

Then create a specific function and use it to retrieve data from Wikipedia. We no longer need the `customRagChain` and will revert back to a formatted prompt:

<details open>
    <summary>src/utils/langchain.js</summary>

```js

```

</details>

BONUS: Try one of the other [community tools](https://js.langchain.com/docs/integrations/tools/)

### Excercise 4 - Connect to your own data source

Next to using community tools we can also build a tool that connect to our own data sources, such as a database. To keep things simple we'll run an in-memory SQLite database and populate it with sample data.


<details open>
    <summary>server.js</summary>

```js

```

</details>

### Excercise 5 - Memory

Agents need more than access to tools to perform effectively, they also need more context which can come from memory. Memory exists at multiple stages, from the current message thread to long-term memory stored in a database. 

<details open>
    <summary>server.js</summary>

```js

```

</details>


human in the loop?
auth?