# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Admin GPT Assistant

The admin UI includes a page at `/admin/assistant` that connects to the backend
GPT assistant endpoint. It accepts a question from the administrator and returns
an AI-generated response. The backend exposes `/api/admin/assistant` which can
be extended to call OpenAI or another LLM service to automate routine tasks.
