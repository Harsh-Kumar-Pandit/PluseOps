"""add_user_notification_preferences_and_email_tracking

Revision ID: f92026090300
Revises: a0b1102ab45e
Create Date: 2026-09-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f92026090300'
down_revision = 'a0b1102ab45e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    user_columns = [c['name'] for c in inspector.get_columns('users')]
    if 'email_notifications_enabled' not in user_columns:
        op.add_column('users', sa.Column('email_notifications_enabled', sa.Boolean(), server_default='true', nullable=False))
    if 'down_alerts_enabled' not in user_columns:
        op.add_column('users', sa.Column('down_alerts_enabled', sa.Boolean(), server_default='true', nullable=False))
    if 'recovery_alerts_enabled' not in user_columns:
        op.add_column('users', sa.Column('recovery_alerts_enabled', sa.Boolean(), server_default='true', nullable=False))

    notif_columns = [c['name'] for c in inspector.get_columns('notifications')]
    if 'email_status' not in notif_columns:
        op.add_column('notifications', sa.Column('email_status', sa.String(length=20), server_default='PENDING', nullable=False))
    if 'email_sent_at' not in notif_columns:
        op.add_column('notifications', sa.Column('email_sent_at', sa.DateTime(), nullable=True))
    if 'email_error' not in notif_columns:
        op.add_column('notifications', sa.Column('email_error', sa.Text(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    notif_columns = [c['name'] for c in inspector.get_columns('notifications')]
    if 'email_error' in notif_columns:
        op.drop_column('notifications', 'email_error')
    if 'email_sent_at' in notif_columns:
        op.drop_column('notifications', 'email_sent_at')
    if 'email_status' in notif_columns:
        op.drop_column('notifications', 'email_status')

    user_columns = [c['name'] for c in inspector.get_columns('users')]
    if 'recovery_alerts_enabled' in user_columns:
        op.drop_column('users', 'recovery_alerts_enabled')
    if 'down_alerts_enabled' in user_columns:
        op.drop_column('users', 'down_alerts_enabled')
    if 'email_notifications_enabled' in user_columns:
        op.drop_column('users', 'email_notifications_enabled')
