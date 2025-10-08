"""add admin table

Revision ID: c447b602374d
Revises: 2566b94b90c5
Create Date: 2025-10-03 14:38:13.755389

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c447b602374d'
down_revision: Union[str, Sequence[str], None] = '2566b94b90c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
