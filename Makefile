# ---- Portable, venv-safe pytest targets ----
PY ?= python3
.PHONY: ai-setup ai-test backend-setup backend-test
ai-setup:
	cd ai-matcher-service && $(PY) -m venv .venv && .venv/bin/python -m pip install -U pip && \
		( [ -f requirements.txt ] && .venv/bin/python -m pip install -r requirements.txt \
		  || .venv/bin/python -m pip install -U pytest numpy pandas scikit-learn )
ai-test: ai-setup
	cd ai-matcher-service && .venv/bin/python -m pytest -q
backend-setup:
	cd backend && $(PY) -m venv .venv && .venv/bin/python -m pip install -U pip && \
		( [ -f requirements.txt ] && .venv/bin/python -m pip install -r requirements.txt \
		  || .venv/bin/python -m pip install -U pytest )
backend-test: backend-setup
	cd backend && .venv/bin/python -m pytest -q
# Run everything
test: ai-test backend-test
all: test
