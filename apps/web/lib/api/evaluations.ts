import { apiFetch } from "./client";

export interface EvaluationItem {
  id: string;
  dataset_name: string;
  suite_type: string;
  status: string;
  metrics?: {
    task_completion?: number;
    rag_relevance?: number;
    faithfulness?: number;
    tool_selection?: number;
    structured_output?: number;
    planning_accuracy?: number;
  };
  total_test_cases?: number;
  passed_test_cases?: number;
  total_scenarios?: number;
  passed_scenarios?: number;
  avg_score?: number;
  avg_latency_ms?: number;
  total_tokens?: number;
  total_cost_usd?: number;
  duration_seconds?: number;
  summary_metrics?: any;
  cases?: any[];
  created_at: string;
}

export async function listEvaluations(): Promise<EvaluationItem[]> {
  try {
    return await apiFetch<EvaluationItem[]>("/api/evaluations");
  } catch {
    return [];
  }
}

export async function getEvaluation(id: string): Promise<EvaluationItem> {
  return apiFetch<EvaluationItem>(`/api/evaluations/${id}`);
}

export async function runEvaluation(datasetName = "interview_prep_v1"): Promise<EvaluationItem> {
  return apiFetch<EvaluationItem>("/api/evaluations/run", {
    method: "POST",
    body: JSON.stringify({ dataset_name: datasetName, suite_type: "end_to_end" }),
  });
}

export const evaluationsApi = {
  listEvaluations,
  getEvaluation,
  runEvaluation,
};
