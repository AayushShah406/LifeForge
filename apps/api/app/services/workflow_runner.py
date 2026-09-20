"""Backward compatibility re-export of workflow service."""
from app.services.workflow_service import WorkflowService, workflow_service, workflow_runner

__all__ = ["WorkflowService", "workflow_service", "workflow_runner"]
