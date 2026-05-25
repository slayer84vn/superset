# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
"""create user branch mapping table

Revision ID: 10905efa3c86
Revises: ce6bd21901ab
Create Date: 2026-05-20 09:30:00.000000

"""

# revision identifiers, used by Alembic.
revision = "10905efa3c86"
down_revision = "ce6bd21901ab"

import sqlalchemy as sa
from alembic import op


def upgrade():
    op.create_table(
        "user_branch_mapping",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(length=128), nullable=False),
        sa.Column("branch_code", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username", "branch_code", name="uq_user_branch"),
    )
    op.create_index(
        "idx_user_branch_username",
        "user_branch_mapping",
        ["username"],
        unique=False,
    )


def downgrade():
    op.drop_index("idx_user_branch_username", table_name="user_branch_mapping")
    op.drop_table("user_branch_mapping")
