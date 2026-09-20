from langgraph.checkpoint.memory import MemorySaver

def get_checkpointer():
    """Returns memory checkpointer for LangGraph state persistence and interruptions."""
    return MemorySaver()
