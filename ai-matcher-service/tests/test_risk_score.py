import pathlib
import sys
import pytest

# Allow importing modules from src/ despite hyphenated package directory
SRC_PATH = pathlib.Path(__file__).resolve().parents[1] / "src"
sys.path.append(str(SRC_PATH))

from utils.risk_score import generate_composite_risk_score


def test_generate_composite_risk_score_basic():
    score = generate_composite_risk_score(0.2, 0.3, 0.1)
    expected = 0.2 * 0.5 + 0.3 * 0.3 + 0.1 * 0.2
    assert score == pytest.approx(expected)


def test_invalid_score_range():
    with pytest.raises(ValueError):
        generate_composite_risk_score(1.2, 0, 0)


def test_custom_weights():
    score = generate_composite_risk_score(0.5, 0.5, 0.5, weights=(1, 0, 0))
    assert score == 0.5
