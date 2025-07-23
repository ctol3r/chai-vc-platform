import os
import sys

# Allow importing from the src directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from explainer import generate_human_readable_explanation

def test_generate_human_readable_explanation():
    decision = {"status": "approved", "anchor": "proof123"}
    explanation = generate_human_readable_explanation(decision)
    assert isinstance(explanation, str)
    assert explanation
