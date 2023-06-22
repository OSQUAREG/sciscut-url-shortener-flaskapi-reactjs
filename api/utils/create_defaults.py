from ..models.user import User
from werkzeug.security import generate_password_hash
from ..utils import db
import os
from dotenv import load_dotenv

load_dotenv()


def drop_create_all():
    db.drop_all()
    db.create_all()

    admin_password = os.getenv('ADMIN_DEFAULT_PWD')

    """creates an admin"""
    admin = User(
        email="admin@osquaregtech.com",
        password_hash=generate_password_hash(admin_password),
        is_admin=True,
    )
    admin.save_to_db()
    