"""add_status_to_stores

Revision ID: 3ff9f9cb6e21
Revises: c447b602374d
Create Date: 2025-10-05 14:58:39.652329

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3ff9f9cb6e21'
down_revision: Union[str, Sequence[str], None] = 'c447b602374d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
