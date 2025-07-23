import os
import json
import random

PROMPTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'prompts')
REPORTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports')


def evaluate_prompt(prompt_text: str) -> float:
    """Return a dummy score for the prompt."""
    random.seed(hash(prompt_text) % 2**32)
    return random.random()


def main():
    results = {}
    for name in sorted(os.listdir(PROMPTS_DIR)):
        if name.endswith('.txt'):
            with open(os.path.join(PROMPTS_DIR, name)) as f:
                text = f.read().strip()
            score = evaluate_prompt(text)
            results[name] = score
            print(f"{name}: {score:.4f}")

    os.makedirs(REPORTS_DIR, exist_ok=True)
    with open(os.path.join(REPORTS_DIR, 'ab_test_results.json'), 'w') as f:
        json.dump(results, f, indent=2)


if __name__ == '__main__':
    main()
