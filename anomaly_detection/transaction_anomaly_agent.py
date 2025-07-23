import argparse
import os
import openai

class TransactionAnomalyAgent:
    """Agent that sends transaction logs to GPT-4 and returns anomalies."""

    def __init__(self, model: str = "gpt-4", api_key: str | None = None) -> None:
        api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = openai.OpenAI(api_key=api_key)
        self.model = model

    def detect_anomalies(self, log_text: str) -> str:
        """Return GPT-4 response highlighting anomalies in the log."""
        messages = [
            {
                "role": "system",
                "content": (
                    "You analyze transaction logs and point out any anomalies or "
                    "unusual patterns that may indicate issues or fraud."
                ),
            },
            {"role": "user", "content": log_text},
        ]
        response = self.client.chat.completions.create(model=self.model, messages=messages)
        return response.choices[0].message.content

def main() -> None:
    parser = argparse.ArgumentParser(description="Flag anomalies in a transaction log using GPT-4")
    parser.add_argument("log_file", help="Path to the transaction log file")
    args = parser.parse_args()
    with open(args.log_file, "r", encoding="utf-8") as fh:
        log_text = fh.read()
    agent = TransactionAnomalyAgent()
    result = agent.detect_anomalies(log_text)
    print(result)

if __name__ == "__main__":
    main()
