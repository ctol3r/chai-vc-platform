from __future__ import annotations

"""Simple multi-agent coordination using LangChain."""

from dataclasses import dataclass
from langchain_community.llms.fake import FakeListLLM
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain.prompts import PromptTemplate

@dataclass
class AgentStep:
    """Represents a single step performed by a specialist agent."""
    name: str
    prompt: str

    def chain(self, llm: FakeListLLM) -> LLMChain:
        template = PromptTemplate.from_template(self.prompt)
        return LLMChain(llm=llm, prompt=template)

class Coordinator:
    """Coordinates issuance, verification and risk agents."""

    def __init__(self) -> None:
        # Fake responses to avoid external API calls
        self.llm = FakeListLLM(responses=[
            "issued",
            "verified",
            "risk_assessed",
        ])
        issuance = AgentStep(
            name="issuance",
            prompt="Issuance specialist processes: {input}",
        )
        verification = AgentStep(
            name="verification",
            prompt="Verification specialist checks: {input}",
        )
        risk = AgentStep(
            name="risk",
            prompt="Risk specialist reviews: {input}",
        )
        self.chain = SimpleSequentialChain(
            chains=[
                issuance.chain(self.llm),
                verification.chain(self.llm),
                risk.chain(self.llm),
            ],
            verbose=True,
        )

    def process(self, payload: str) -> str:
        """Run the payload through the specialists."""
        return self.chain.run(payload)


def demo() -> None:
    """Run a simple demonstration of the coordinator."""
    coord = Coordinator()
    result = coord.process("new credential application")
    print("Final result:", result)


if __name__ == "__main__":
    demo()
