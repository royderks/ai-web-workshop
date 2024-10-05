import express from "express";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/api/message", async (req, res, next) => {
    try {
        res.json({ hello: 'world!' })
    } catch (e) {
        next(e)
    }
});

const server = app.listen(3000, "0.0.0.0", () =>
    console.log("Server is listening on http://localhost:3000/ ...")
);

ViteExpress.bind(app, server);