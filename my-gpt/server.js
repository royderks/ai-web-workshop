import express from "express";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
import { generateAnswer } from './src/utils/langchain.js'

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/api/message", async (req, res, next) => {
  try {
    const { question } = req?.body
    const answer = await generateAnswer(question)

    res.json({ answer })
  } catch (e) { 
    next(e) 
  }
});

const server = app.listen(3000, "0.0.0.0", () =>
  console.log("Server is listening...")
);

ViteExpress.bind(app, server);
