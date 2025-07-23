import { Configuration, OpenAIApi } from "openai";

export class Chatbot {
  private openai: OpenAIApi;

  constructor(apiKey: string) {
    const config = new Configuration({ apiKey });
    this.openai = new OpenAIApi(config);
  }

  async ask(message: string): Promise<string> {
    const response = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an onboarding assistant that helps users register and recover wallets.",
        },
        { role: "user", content: message },
      ],
    });

    return (
      response.data.choices[0]?.message?.content?.trim() || ""
    );
  }
}
