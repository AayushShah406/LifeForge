from typing import Dict, Any
from app.core.model_router import MODEL_PRICING


class CostTracker:
    """Calculates and monitors token usage and financial cost across models."""

    @staticmethod
    def calculate_cost(model_name: str, prompt_tokens: int, completion_tokens: int) -> float:
        pricing = MODEL_PRICING.get(model_name, {"input": 0.1, "output": 0.4})
        cost = (prompt_tokens * pricing["input"] + completion_tokens * pricing["output"]) / 1_000_000
        return round(cost, 6)

    @staticmethod
    def get_model_pricing_table() -> Dict[str, Dict[str, float]]:
        return MODEL_PRICING


cost_tracker = CostTracker()
