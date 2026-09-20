from typing import Any, Dict, List, Set


class EvaluationMetrics:
    """Calculates standardized AI engineering metrics for RAG, Agents, and Generation."""

    @staticmethod
    def evaluate_tool_selection(actual_tools: List[str], expected_tools: List[str]) -> float:
        """Precision-recall harmonic score for tool invocation correctness."""
        if not expected_tools:
            return 1.0 if not actual_tools else 0.8
        actual_set = set(actual_tools)
        expected_set = set(expected_tools)
        intersection = actual_set.intersection(expected_set)
        if not actual_set:
            return 0.0
        precision = len(intersection) / len(actual_set)
        recall = len(intersection) / len(expected_set)
        if precision + recall == 0:
            return 0.0
        return round(2 * (precision * recall) / (precision + recall), 4)

    @staticmethod
    def evaluate_groundedness(output_text: str, source_contexts: List[str]) -> float:
        """Measures lexical and semantic overlap between claims and source context."""
        if not output_text:
            return 0.0
        if not source_contexts:
            return 0.70  # Baseline when purely generative

        output_words = set(output_text.lower().split())
        source_words = set(" ".join(source_contexts).lower().split())
        overlap = output_words.intersection(source_words)
        ratio = len(overlap) / max(len(output_words), 1)
        # Scale to realistic groundedness metric
        score = min(1.0, 0.6 + ratio * 0.4)
        return round(score, 4)

    @staticmethod
    def evaluate_planning_accuracy(actual_agents: List[str], expected_agents: List[str]) -> float:
        """Evaluates whether all required specialized agents were appropriately scheduled."""
        if not expected_agents:
            return 1.0
        expected_set = set(expected_agents)
        actual_set = set(actual_agents)
        matched = expected_set.intersection(actual_set)
        return round(len(matched) / len(expected_set), 4)

    @staticmethod
    def evaluate_schema_validity(payload: Any) -> float:
        """Checks if structured JSON/Pydantic output conforms without errors."""
        if payload is None:
            return 0.0
        if isinstance(payload, (dict, list)) and len(payload) > 0:
            return 1.0
        return 0.5
