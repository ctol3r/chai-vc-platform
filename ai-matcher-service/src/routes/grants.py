import os
import json
from typing import List, Dict

try:
    import openai
except Exception:  # pragma: no cover - openai may not be installed
    openai = None


def propose_allocations(projects: List[str], total_budget: float) -> Dict[str, float]:
    """Return funding allocations for a list of projects."""
    if not projects:
        return {}

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or openai is None:
        share = round(total_budget / len(projects), 2)
        return {p: share for p in projects}

    openai.api_key = api_key
    prompt = (
        "You are an assistant allocating community grant funds. "
        f"Distribute ${total_budget} among the following projects: {', '.join(projects)}. "
        "Respond with a JSON object mapping each project to its allocation."
    )
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
    )
    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        share = round(total_budget / len(projects), 2)
        return {p: share for p in projects}
