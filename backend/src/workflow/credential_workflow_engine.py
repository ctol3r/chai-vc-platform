class CredentialWorkflowEngine:
    """Simple engine orchestrating credential issuance using GPT-4 function calls."""
    def __init__(self, openai_client):
        self.openai = openai_client
        self.steps = []
        self.functions = [
            {
                "name": "verify_identity",
                "description": "Verify the applicant identity.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"}
                    },
                    "required": ["user_id"]
                },
            },
            {
                "name": "issue_credential",
                "description": "Issue the credential once checks pass.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "credential_data": {"type": "string"}
                    },
                    "required": ["user_id", "credential_data"]
                },
            },
        ]

    def verify_identity(self, user_id):
        self.steps.append(f"verify_identity({user_id})")
        return "identity_verified"

    def issue_credential(self, user_id, credential_data):
        self.steps.append(f"issue_credential({user_id})")
        return f"credential_issued:{user_id}"

    def run(self, prompt):
        import json

        messages = [{"role": "user", "content": prompt}]
        while True:
            resp = self.openai.ChatCompletion.create(
                model="gpt-4-turbo",
                messages=messages,
                functions=self.functions,
            )
            msg = resp["choices"][0]["message"]
            if "function_call" in msg:
                name = msg["function_call"]["name"]
                args = json.loads(msg["function_call"].get("arguments", "{}"))
                result = getattr(self, name)(**args)
                messages.append(msg)
                messages.append({"role": "function", "name": name, "content": result})
            else:
                messages.append(msg)
                return msg.get("content", "")
