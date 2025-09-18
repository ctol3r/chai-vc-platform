.PHONY: bootstrap lint test bench build up down smoke ai-setup ai-test backend-setup backend-py backend-jest backend-test hardhat-test

PY ?= python3

bootstrap:
	cp -n .env.example .env || true
	npm install

lint:
	npm run lint || true

ais-setup:
	cd ai-matcher-service && $(PY) -m venv .venv && .venv/bin/python -m pip install --upgrade "pip<25" && \
		( [ -f requirements.txt ] && .venv/bin/python -m pip install -r requirements.txt \
		  || .venv/bin/python -m pip install -U pytest numpy pandas scikit-learn )

ais-test: ai-setup
	cd ai-matcher-service && .venv/bin/python -m pytest -q

backend-setup:
	cd backend && $(PY) -m venv .venv && .venv/bin/python -m pip install --upgrade "pip<25" && \
		( [ -f requirements.txt ] && .venv/bin/python -m pip install -r requirements.txt \
		  || .venv/bin/python -m pip install -U pytest )
	cd backend && npm install

backend-py: backend-setup
	cd backend && .venv/bin/python -m pytest -q

backend-jest: backend-setup
	cd backend && npm test -- --runInBand

backend-test: backend-py backend-jest

hardhat-test:
	npm install
	npx hardhat test

test: hardhat-test backend-test ai-test

bench:
	npm run bench || true

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down -v

smoke:
	curl -fsS http://localhost:8080/health || exit 1
