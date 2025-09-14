.PHONY: ai-setup ai-test backend-setup backend-test test all

# AI matcher (Python)
ai-setup:
	cd ai-matcher-service && python3 -m venv .venv && . .venv/bin/activate && pip install -U pip && \
	( [ -f requirements.txt ] && pip install -r requirements.txt || pip install pytest numpy pandas scikit-learn )

ai-test:
	cd ai-matcher-service && . .venv/bin/activate && pytest -q

# Backend (Python)
backend-setup:
	cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -U pip && \
	( [ -f requirements.txt ] && pip install -r requirements.txt || pip install pytest )

backend-test:
	cd backend && . .venv/bin/activate && pytest -q

# Run everything
test: ai-setup backend-setup ai-test backend-test
all: test

# ---- overrides to make venv usage reliable ----
# Always call tools via the venv's python to avoid PATH/activation issues.
.PHONY: ai-setup ai-test backend-setup backend-test

ai-setup:
	cd ai-matcher-service && \
		python3 -m venv .venv && \
		.venv/bin/python -m pip install -U pip && \
		( [ -f requirements.txt ] && .venv/bin/python -m pip install -r requirements.txt \
		  || .venv/bin/python -m pip install pytest numpy pandas scikit-learn )

ai-test:
	cd ai-matcher-service && .venv/bin/python -m pytest -q

backend-setup:
	cd backend && \
		python3 -m venv .venv && \
		.venv/bin/python -m pip install -U pip && \
		( [ -f requirements.txt ] && .venv/bin/python -m pip install -r requirements.txt \
		  || .venv/bin/python -m pip install pytest )

backend-test:
	cd backend && .venv/bin/python -m pytest -q
# ---- end overrides ----

# ---- reliable venv-aware targets (overrides) ----
.PHONY: ai-setup ai-test backend-setup backend-test

ai-test: ai-setup
	# Run pytest via the venv interpreter (no fragile activation)
	cd ai-matcher-service && .venv/bin/python -m pytest -q

backend-test: backend-setup
	cd backend && .venv/bin/python -m pytest -q
# ---- end overrides ----

# Use brewed python for venv creation; call tools via venv interpreter; enforce order.
.PHONY: ai-setup ai-test backend-setup backend-test

ai-setup:
	cd ai-matcher-service && \
		/opt/homebrew/bin/python3 -m venv .venv && \
		.venv/bin/python -m pip install -U pip && \
		( [ -f requirements.txt ] && .venv/bin/python -m pip install -r requirements.txt \
		  || .venv/bin/python -m pip install -U pytest numpy pandas scikit-learn )

ai-test: ai-setup
	cd ai-matcher-service && .venv/bin/python -m pytest -q

backend-setup:
	cd backend && \
		/opt/homebrew/bin/python3 -m venv .venv && \
		.venv/bin/python -m pip install -U pip && \
		( [ -f requirements.txt ] && .venv/bin/python -m pip install -r requirements.txt \
		  || .venv/bin/python -m pip install -U pytest )

backend-test: backend-setup
	cd backend && .venv/bin/python -m pytest -q

# ---- final overrides (portable; last definition wins) ----
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
# ---- end final overrides ----
