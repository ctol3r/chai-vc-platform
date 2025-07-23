import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.src.workflow.credential_workflow_engine import CredentialWorkflowEngine

class FakeChatCompletion:
    def __init__(self):
        self.call = 0

    def create(self, model, messages, functions):
        self.call += 1
        if self.call == 1:
            return {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "function_call": {
                                "name": "verify_identity",
                                "arguments": json.dumps({"user_id": "u1"})
                            }
                        }
                    }
                ]
            }
        elif self.call == 2:
            return {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "function_call": {
                                "name": "issue_credential",
                                "arguments": json.dumps({"user_id": "u1", "credential_data": "data"})
                            }
                        }
                    }
                ]
            }
        else:
            return {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": "Credential issued"
                        }
                    }
                ]
            }

class FakeOpenAI:
    def __init__(self):
        self.ChatCompletion = FakeChatCompletion()

def test_workflow_engine_sequencing():
    engine = CredentialWorkflowEngine(FakeOpenAI())
    result = engine.run("start")
    assert result == "Credential issued"
    assert engine.steps == ["verify_identity(u1)", "issue_credential(u1)"]
