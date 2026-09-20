"""initial_lifeforge_schema

Revision ID: 7f5acf989b3b
Revises: 
Create Date: 2026-09-19 20:35:14.996724

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '7f5acf989b3b'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_superuser', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. goals
    op.create_table(
        'goals',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=False, server_default='general'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('target_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_goals_user_id'), 'goals', ['user_id'], unique=False)

    # 3. workflows
    op.create_table(
        'workflows',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('goal_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('plan_spec', sa.JSON(), nullable=True),
        sa.Column('current_step_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['goal_id'], ['goals.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workflows_goal_id'), 'workflows', ['goal_id'], unique=False)
    op.create_index(op.f('ix_workflows_user_id'), 'workflows', ['user_id'], unique=False)

    # 4. workflow_steps
    op.create_table(
        'workflow_steps',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('agent_name', sa.String(length=100), nullable=False),
        sa.Column('step_type', sa.String(length=100), nullable=False, server_default='execution'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('input_payload', sa.JSON(), nullable=True),
        sa.Column('output_payload', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('execution_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workflow_steps_workflow_id'), 'workflow_steps', ['workflow_id'], unique=False)

    # 5. agent_runs
    op.create_table(
        'agent_runs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=False),
        sa.Column('step_id', sa.String(length=36), nullable=True),
        sa.Column('agent_name', sa.String(length=100), nullable=False),
        sa.Column('model_name', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='running'),
        sa.Column('input_prompt', sa.Text(), nullable=True),
        sa.Column('output_response', sa.Text(), nullable=True),
        sa.Column('prompt_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('completion_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('cost_usd', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('latency_ms', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('langsmith_trace_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['step_id'], ['workflow_steps.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_runs_workflow_id'), 'agent_runs', ['workflow_id'], unique=False)
    op.create_index(op.f('ix_agent_runs_step_id'), 'agent_runs', ['step_id'], unique=False)

    # 6. tool_calls
    op.create_table(
        'tool_calls',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('agent_run_id', sa.String(length=36), nullable=False),
        sa.Column('tool_name', sa.String(length=100), nullable=False),
        sa.Column('arguments', sa.JSON(), nullable=True),
        sa.Column('result', sa.JSON(), nullable=True),
        sa.Column('is_error', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('latency_ms', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['agent_run_id'], ['agent_runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tool_calls_agent_run_id'), 'tool_calls', ['agent_run_id'], unique=False)

    # 7. approvals
    op.create_table(
        'approvals',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=False),
        sa.Column('step_id', sa.String(length=36), nullable=True),
        sa.Column('action_name', sa.String(length=100), nullable=False),
        sa.Column('action_payload', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('reviewed_by', sa.String(length=36), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['step_id'], ['workflow_steps.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_approvals_workflow_id'), 'approvals', ['workflow_id'], unique=False)
    op.create_index(op.f('ix_approvals_step_id'), 'approvals', ['step_id'], unique=False)

    # 8. documents
    op.create_table(
        'documents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('file_path', sa.String(length=1024), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='uploaded'),
        sa.Column('chunk_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('extracted_entities', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_user_id'), 'documents', ['user_id'], unique=False)

    # 9. tasks
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=36), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='todo'),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scheduled_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scheduled_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('calendar_event_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)
    op.create_index(op.f('ix_tasks_workflow_id'), 'tasks', ['workflow_id'], unique=False)

    # 10. integrations
    op.create_table(
        'integrations',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('scopes', sa.JSON(), nullable=False),
        sa.Column('access_token', sa.Text(), nullable=True),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_connected', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('is_sandbox_simulated', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('metadata_info', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_integrations_user_id'), 'integrations', ['user_id'], unique=False)

    # 11. evaluation_runs
    op.create_table(
        'evaluation_runs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('dataset_name', sa.String(length=255), nullable=False),
        sa.Column('suite_type', sa.String(length=100), nullable=False, server_default='end_to_end'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='running'),
        sa.Column('total_test_cases', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('passed_test_cases', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('avg_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('avg_latency_ms', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_cost_usd', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('summary_metrics', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 12. evaluation_results
    op.create_table(
        'evaluation_results',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('run_id', sa.String(length=36), nullable=False),
        sa.Column('test_case_id', sa.String(length=100), nullable=False),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('actual_output', sa.Text(), nullable=True),
        sa.Column('score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('passed', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('latency_ms', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('tokens_used', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('cost_usd', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('details', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['evaluation_runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evaluation_results_run_id'), 'evaluation_results', ['run_id'], unique=False)


def downgrade() -> None:
    op.drop_table('evaluation_results')
    op.drop_table('evaluation_runs')
    op.drop_table('integrations')
    op.drop_table('tasks')
    op.drop_table('documents')
    op.drop_table('approvals')
    op.drop_table('tool_calls')
    op.drop_table('agent_runs')
    op.drop_table('workflow_steps')
    op.drop_table('workflows')
    op.drop_table('goals')
    op.drop_table('users')
