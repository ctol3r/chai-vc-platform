import express from "express";
import { Chatbot } from "./chatbot";

const app = express();
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY || "";
const bot = new Chatbot(apiKey);

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  try {
    const reply = await bot.ask(message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get reply" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Chatbot service running on port ${port}`);
});
