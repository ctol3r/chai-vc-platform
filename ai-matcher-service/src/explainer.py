import os

try:
    import openai
except ImportError:  # pragma: no cover - optional dependency
    openai = None

def generate_human_readable_explanation(decision: dict) -> str:
    """Generate a human readable explanation for an anchored decision.

    If the OpenAI package and API key are available, the function will
    delegate explanation generation to the GPT API. Otherwise it falls
    back to a simple formatted string.
    """
    prompt = (
        "Provide a human readable explanation for the following anchored "
        f"decision: {decision}"
    )
    api_key = os.getenv("OPENAI_API_KEY")

    if openai and api_key:
        openai.api_key = api_key
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message["content"].strip()
        except Exception:
            return f"Explanation for {decision}"

    return f"Explanation for {decision}"
