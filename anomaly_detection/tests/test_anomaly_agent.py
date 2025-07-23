import builtins
import types

import anomaly_detection.transaction_anomaly_agent as agent_module

class FakeCompletions:
    def __init__(self):
        self.last_kwargs = None

    def create(self, **kwargs):
        self.last_kwargs = kwargs
        return types.SimpleNamespace(
            choices=[types.SimpleNamespace(message=types.SimpleNamespace(content="fake anomalies"))]
        )

class FakeClient:
    def __init__(self, *args, **kwargs):
        self.chat = types.SimpleNamespace(completions=FakeCompletions())


def test_detect_anomalies_uses_openai():
    real_openai = agent_module.openai.OpenAI
    agent_module.openai.OpenAI = FakeClient
    try:
        agent = agent_module.TransactionAnomalyAgent()
        result = agent.detect_anomalies("sample log")
        assert result == "fake anomalies"
    finally:
        agent_module.openai.OpenAI = real_openai
