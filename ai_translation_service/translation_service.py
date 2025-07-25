import os
from typing import Optional
import openai

class AITranslator:
    """Translate text to different languages using OpenAI."""

    def __init__(self, model: str = "gpt-3.5-turbo", api_key: Optional[str] = None, client: Optional[openai.OpenAI] = None) -> None:
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if client is not None:
            self.client = client
        else:
            if not self.api_key:
                raise ValueError("OpenAI API key not set")
            self.client = openai.OpenAI(api_key=self.api_key)
        self.model = model

    def translate(self, text: str, target_language: str) -> str:
        """Return the translated text."""
        prompt = f"Translate the following text to {target_language}:\n{text}"
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
