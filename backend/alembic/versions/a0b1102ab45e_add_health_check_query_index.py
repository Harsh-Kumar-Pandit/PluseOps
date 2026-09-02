"""add health check query index

Revision ID: a0b1102ab45e
Revises: 38fbee6e05ca
Create Date: 2026-09-01 18:24:45.587487

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a0b1102ab45e'
down_revision: Union[str, Sequence[str], None] = '38fbee6e05ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "ix_health_checks_monitor_checked_at",
        "health_checks",
        ["monitor_id", "checked_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_health_checks_monitor_checked_at",
        table_name="health_checks",
    )