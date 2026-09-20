"""API Router exports for LifeForge (Section 35).

Exposes both `/api/v1/...` (canonical versioned API) and `/api/...` (backward compatibility).
"""
from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.goals import router as goals_router
from app.api.routes.workflows import router as workflows_router
from app.api.routes.documents import router as documents_router
from app.api.routes.memories import router as memories_router
from app.api.routes.approvals import router as approvals_router
from app.api.routes.tasks import router as tasks_router
from app.api.routes.agent_runs import router as agent_runs_router
from app.api.routes.evaluations import router as evaluations_router
from app.api.routes.integrations import router as integrations_router
from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.agents import router as agents_router
from app.api.routes.search import router as search_router
from app.api.routes.developer import router as developer_router
from app.api.routes.tools_mcp import router as tools_mcp_router
from app.api.routes.knowledge_search import router as knowledge_search_router
from app.api.routes.observability import router as observability_router

# 1. Canonical Version 1 API Router (/api/v1/...)
api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(goals_router)
api_v1_router.include_router(workflows_router)
api_v1_router.include_router(tasks_router)
api_v1_router.include_router(approvals_router)
api_v1_router.include_router(documents_router)
api_v1_router.include_router(memories_router)
api_v1_router.include_router(search_router)
api_v1_router.include_router(agents_router)
api_v1_router.include_router(tools_mcp_router)
api_v1_router.include_router(agent_runs_router)
api_v1_router.include_router(evaluations_router)
api_v1_router.include_router(integrations_router)
api_v1_router.include_router(developer_router)
api_v1_router.include_router(knowledge_search_router)
api_v1_router.include_router(observability_router)

# 2. Legacy / Compatibility Router (/api/...)
api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(goals_router)
api_router.include_router(workflows_router)
api_router.include_router(documents_router)
api_router.include_router(memories_router)
api_router.include_router(approvals_router)
api_router.include_router(tasks_router)
api_router.include_router(agent_runs_router)
api_router.include_router(evaluations_router)
api_router.include_router(integrations_router)
api_router.include_router(developer_router)
api_router.include_router(tools_mcp_router)
api_router.include_router(search_router)
api_router.include_router(agents_router)
api_router.include_router(knowledge_search_router)
api_router.include_router(observability_router)

__all__ = ["api_v1_router", "api_router"]
