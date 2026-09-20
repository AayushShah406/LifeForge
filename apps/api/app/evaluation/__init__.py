"""AI Evaluation Suite package."""

from app.evaluation.metrics import EvaluationMetrics
from app.evaluation.datasets import BENCHMARK_DATASETS

__all__ = [
    "EvaluationMetrics",
    "BENCHMARK_DATASETS",
]
