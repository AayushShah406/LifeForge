"""LifeForge API Route Modules."""
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

__all__ = [
    "health_router",
    "goals_router",
    "workflows_router",
    "documents_router",
    "memories_router",
    "approvals_router",
    "tasks_router",
    "agent_runs_router",
    "evaluations_router",
    "integrations_router",
]
