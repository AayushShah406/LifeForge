.PHONY: help install dev dev-api dev-web test test-api test-web eval docker-up docker-down lint format

help:
	@echo "LifeForge Command Center"
	@echo "======================="
	@echo "make install      - Install all backend & frontend dependencies"
	@echo "make dev          - Start both backend and frontend dev servers"
	@echo "make dev-api      - Start FastAPI backend with reload"
	@echo "make dev-web      - Start Next.js frontend"
	@echo "make test         - Run full test suite (unit, agent, RAG, approval)"
	@echo "make eval         - Run AI evaluation benchmarks"
	@echo "make docker-up    - Launch full stack with Docker Compose"
	@echo "make docker-down  - Teardown Docker Compose services"
	@echo "make lint         - Run linting checks on backend and frontend"

install:
	@echo "Installing Backend Dependencies..."
	py -3.12 -m pip install -r apps/api/requirements.txt
	@echo "Installing Frontend Dependencies..."
	cd apps/web && npm install

dev-api:
	cd apps/api && py -3.12 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-web:
	cd apps/web && npm run dev

dev:
	@echo "Run 'make dev-api' and 'make dev-web' in separate terminal windows."

test: test-api

test-api:
	cd apps/api && py -3.12 -m pytest tests -v

eval:
	cd apps/api && py -3.12 -m app.evaluation.runner

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down -v

lint:
	cd apps/api && py -3.12 -m ruff check .
	cd apps/web && npm run lint
