"""Benchmark evaluation datasets for LifeForge."""

BENCHMARK_DATASETS = {
    "interview_prep_v1": [
        {
            "id": "tc_interview_google",
            "prompt": "Prepare me for my interview next Thursday at Google for Senior AI Systems Engineer.",
            "expected_intent": "interview_preparation",
            "expected_agents": ["research", "document", "interview", "planning"],
            "expected_tools": ["web_search", "document_search", "calendar_availability"],
            "expected_sensitive_actions": ["calendar_create_event"],
            "target_score": 0.90
        },
        {
            "id": "tc_interview_mock_session",
            "prompt": "Conduct a mock interview on LangGraph state machines and distributed inference bottlenecks.",
            "expected_intent": "interview_preparation",
            "expected_agents": ["interview", "verification"],
            "expected_tools": ["web_search"],
            "expected_sensitive_actions": [],
            "target_score": 0.88
        }
    ],
    "document_qa_v1": [
        {
            "id": "tc_doc_resume_jd_matching",
            "prompt": "How well does my resume match this job description for Staff AI Architect?",
            "expected_intent": "document_intelligence",
            "expected_agents": ["document", "interview", "verification"],
            "expected_tools": ["document_search"],
            "expected_sensitive_actions": [],
            "target_score": 0.92
        }
    ],
    "study_planner_v1": [
        {
            "id": "tc_study_langgraph_30days",
            "prompt": "Create a 30-day plan for learning LangGraph and stateful agent systems.",
            "expected_intent": "study_planning",
            "expected_agents": ["research", "planning", "verification"],
            "expected_tools": ["web_search", "calendar_availability", "task_create"],
            "expected_sensitive_actions": ["calendar_create_event"],
            "target_score": 0.90
        }
    ]
}
