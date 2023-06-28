"""initial migration

Revision ID: 4450f5e980f4
Revises: 
Create Date: 2023-06-28 13:59:30.926016

"""
from alembic import op
import sqlalchemy as sa

from api.utils.create_defaults import create_default_admin, empty_qr_folder


# revision identifiers, used by Alembic.
revision = "4450f5e980f4"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_admin", sa.Boolean(), nullable=True),
        sa.Column("date_created", sa.Date(), nullable=True),
        sa.Column("date_modified", sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_table(
        "links",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("long_url", sa.String(length=512), nullable=False),
        sa.Column("short_url", sa.String(length=20), nullable=False),
        sa.Column("is_custom", sa.Boolean(), nullable=True),
        sa.Column("visits", sa.Integer(), nullable=False),
        sa.Column("qr_code_added", sa.Boolean(), nullable=True),
        sa.Column("qr_code_id", sa.String(), nullable=True),
        sa.Column("date_created", sa.Date(), nullable=True),
        sa.Column("date_modified", sa.Date(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("short_url"),
    )
    op.create_table(
        "click_analytics",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("link_id", sa.Integer(), nullable=False),
        sa.Column("user_agent", sa.String(), nullable=True),
        sa.Column("referrer", sa.String(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
        sa.Column("ip_address", sa.String(), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("country", sa.String(), nullable=True),
        sa.Column("state", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("device_type", sa.String(), nullable=True),
        sa.Column("operating_system", sa.String(), nullable=True),
        sa.Column("browser", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["link_id"],
            ["links.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###

    # Manually added
    # from decouple import config
    # from werkzeug.security import generate_password_hash
    # from datetime import datetime

    create_default_admin()
    empty_qr_folder()

    # password_hash = generate_password_hash(config("ADMIN_DEFAULT_PWD"))

    # op.execute(
    #     f"""
    #     INSERT INTO users
    #     (username, email, password_hash, is_admin, date_created)
    #     VALUES
    #     ("admin", "osquaregtech@gmail.com", "{password_hash}", True,  CURRENT_TIMESTAMP);
    #     """
    # )


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("click_analytics")
    op.drop_table("links")
    op.drop_table("users")
    # ### end Alembic commands ###