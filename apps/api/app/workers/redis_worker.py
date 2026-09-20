import asyncio
import json
import logging
from typing import Any, Dict, Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger("lifeforge.workers.redis")

# Redis Queue Keys
QUEUE_DOCUMENTS = "lifeforge:queue:documents"
QUEUE_EMBEDDINGS = "lifeforge:queue:embeddings"
QUEUE_WORKFLOWS = "lifeforge:queue:workflows"
QUEUE_EVALUATIONS = "lifeforge:queue:evaluations"


class RedisWorkerManager:
    """Production Redis Worker & Job Queue Manager for background workloads."""

    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self._redis: Optional[aioredis.Redis] = None
        self._is_connected: bool = False

    async def get_client(self) -> Optional[aioredis.Redis]:
        """Obtain async Redis connection with graceful fallback."""
        if self._redis is None:
            try:
                self._redis = aioredis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=2.0
                )
                await self._redis.ping()
                self._is_connected = True
                logger.info(f"Connected to Redis worker queue at {self.redis_url}")
            except Exception as e:
                logger.warning(f"Redis is not running at {self.redis_url} ({e}); jobs will execute in-process.")
                self._is_connected = False
                self._redis = None
        return self._redis

    async def ping(self) -> bool:
        """Checks Redis connectivity and returns True if connected, False otherwise."""
        try:
            r = await self.get_client()
            if r and self._is_connected:
                await r.ping()
                return True
            return False
        except Exception:
            return False

    async def enqueue_document_ingestion(
        self,
        file_path: str,
        filename: str,
        document_id: str,
        user_id: str,
        document_type: str = "general"
    ) -> str:
        """Enqueue document ingestion and vector chunking job."""
        job_id = f"doc_job_{document_id}"
        payload = {
            "job_id": job_id,
            "type": "document_ingestion",
            "file_path": file_path,
            "filename": filename,
            "document_id": document_id,
            "user_id": user_id,
            "document_type": document_type
        }

        r = await self.get_client()
        if r and self._is_connected:
            await r.rpush(QUEUE_DOCUMENTS, json.dumps(payload))
            logger.info(f"Enqueued document ingestion job {job_id} to Redis.")
        else:
            # Execute asynchronously in-process
            asyncio.create_task(self.process_document_job(payload))

        return job_id

    async def enqueue_workflow_run(
        self,
        workflow_id: str,
        goal: str,
        user_id: str
    ) -> str:
        """Enqueue long-running LangGraph workflow execution."""
        job_id = f"wf_job_{workflow_id}"
        payload = {
            "job_id": job_id,
            "type": "workflow_execution",
            "workflow_id": workflow_id,
            "goal": goal,
            "user_id": user_id
        }

        r = await self.get_client()
        if r and self._is_connected:
            await r.rpush(QUEUE_WORKFLOWS, json.dumps(payload))
            logger.info(f"Enqueued workflow execution job {job_id} to Redis.")
        else:
            asyncio.create_task(self.process_workflow_job(payload))

        return job_id

    async def enqueue_evaluation_job(
        self,
        dataset_name: str,
        suite_type: str
    ) -> str:
        """Enqueue AI evaluation benchmark run."""
        job_id = f"eval_job_{dataset_name}"
        payload = {
            "job_id": job_id,
            "type": "evaluation_benchmark",
            "dataset_name": dataset_name,
            "suite_type": suite_type
        }

        r = await self.get_client()
        if r and self._is_connected:
            await r.rpush(QUEUE_EVALUATIONS, json.dumps(payload))
            logger.info(f"Enqueued evaluation job {job_id} to Redis.")
        else:
            asyncio.create_task(self.process_evaluation_job(payload))

        return job_id

    # --- Job Processors ---

    async def process_document_job(self, payload: Dict[str, Any]) -> None:
        """Processes document parsing and Weaviate insertion."""
        from app.rag.ingestion import document_ingestion_pipeline
        try:
            logger.info(f"Processing document job {payload.get('job_id')}")
            await document_ingestion_pipeline.ingest_document(
                file_path=payload["file_path"],
                filename=payload["filename"],
                document_id=payload["document_id"],
                user_id=payload["user_id"],
                document_type=payload.get("document_type", "general")
            )
            logger.info(f"Completed document job {payload.get('job_id')}")
        except Exception as e:
            logger.error(f"Error executing document job {payload.get('job_id')}: {e}")

    async def process_workflow_job(self, payload: Dict[str, Any]) -> None:
        """Processes a background workflow run."""
        from app.workflows.lifeforge_graph import lifeforge_engine
        try:
            logger.info(f"Processing workflow job {payload.get('job_id')}")
            initial_state = {
                "workflow_id": payload["workflow_id"],
                "user_id": payload["user_id"],
                "goal": payload["goal"],
                "intent": None,
                "plan": None,
                "current_step": None,
                "completed_steps": [],
                "agent_outputs": {},
                "retrieved_context": {},
                "memory_context": [],
                "tool_results": {},
                "pending_approvals": [],
                "verification_results": [],
                "errors": [],
                "status": "running",
                "final_result": None
            }
            await lifeforge_engine.graph.ainvoke(
                initial_state,
                config={"configurable": {"thread_id": payload["workflow_id"]}}
            )
            logger.info(f"Completed workflow job {payload.get('job_id')}")
        except Exception as e:
            logger.error(f"Error executing workflow job {payload.get('job_id')}: {e}")

    async def process_evaluation_job(self, payload: Dict[str, Any]) -> None:
        """Processes evaluation benchmark."""
        from app.evaluation.runner import evaluation_runner
        try:
            logger.info(f"Processing evaluation job {payload.get('job_id')}")
            await evaluation_runner.run_benchmark(dataset_name=payload.get("dataset_name", "interview_prep_v1"))
            logger.info(f"Completed evaluation job {payload.get('job_id')}")
        except Exception as e:
            logger.error(f"Error executing evaluation job {payload.get('job_id')}: {e}")

    async def close(self) -> None:
        if self._redis:
            try:
                await self._redis.close()
            except Exception:
                pass
            self._redis = None
            self._is_connected = False


redis_worker = RedisWorkerManager()
