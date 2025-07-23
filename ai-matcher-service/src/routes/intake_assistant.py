from fastapi import APIRouter
from pydantic import BaseModel
import openai
import os

router = APIRouter()

openai.api_key = os.getenv("OPENAI_API_KEY")

class JobPostRequest(BaseModel):
    position: str
    company: str
    skills: list[str] | None = None

@router.post("/assistant/draft-job-post")
async def draft_job_post(req: JobPostRequest):
    """Use OpenAI to draft a short job post."""
    messages = [
        {"role": "system", "content": "You are a recruiting assistant that drafts job postings."},
        {"role": "user", "content": f"Create a job post for a {req.position} at {req.company}."},
    ]
    if req.skills:
        messages.append({"role": "user", "content": "Required skills: " + ", ".join(req.skills)})

    func = {
        "name": "draft_job_post",
        "description": "Draft a short job posting.",
        "parameters": {
            "type": "object",
            "properties": {"text": {"type": "string", "description": "Job post text"}},
            "required": ["text"],
        },
    }

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0613",
        messages=messages,
        functions=[func],
        function_call={"name": "draft_job_post"},
    )

    choice = response.choices[0]
    draft_text = ""
    if choice.message.get("function_call"):
        draft_text = choice.message["function_call"].get("arguments", "")
    else:
        draft_text = choice.message.get("content", "")

    return {"draft": draft_text}
