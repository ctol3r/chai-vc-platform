# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Chatbot Service

A simple GPT-powered self-service chatbot is provided for user onboarding and wallet recovery. The service is implemented in `backend/src/chatbot` and exposes a `/chat` endpoint.

### Running the chatbot

1. Install dependencies:
   ```bash
   npm install express openai
   ```
2. Set the `OPENAI_API_KEY` environment variable with your OpenAI API key.
3. Start the service using `ts-node` or a compiled build:
   ```bash
   npx ts-node backend/src/chatbot/server.ts
   ```
4. Send a POST request to `http://localhost:3001/chat` with a JSON body:
   ```json
   { "message": "How do I recover my wallet?" }
   ```
   The response will contain the assistant's reply.
