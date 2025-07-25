import os
import json
import subprocess

try:
    import openai
except ImportError:
    openai = None


def generate_scenarios():
    """Use OpenAI's API to generate penetration test scenarios."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY not provided. Skipping scenario generation.")
        return []
    if openai is None:
        print("openai package not installed. Unable to generate scenarios.")
        return []

    openai.api_key = api_key
    prompt = (
        "Generate three penetration testing scenarios in JSON format. "
        "Each scenario should include a description and the curl command to execute."
    )
    try:
        resp = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        content = resp["choices"][0]["message"]["content"]
        scenarios = json.loads(content)
        return scenarios
    except Exception as exc:
        print(f"Failed to generate scenarios: {exc}")
        return []


def run_scenarios(scenarios):
    """Run curl commands from scenarios."""
    for scenario in scenarios:
        cmd = scenario.get("curl") or scenario.get("command")
        if not cmd:
            continue
        print(f"Running: {cmd}")
        subprocess.run(cmd, shell=True, check=False)


def main():
    scenarios = generate_scenarios()
    if not scenarios:
        print("No scenarios to run.")
        return
    run_scenarios(scenarios)


if __name__ == "__main__":
    main()
