from ..models.user import User
from werkzeug.security import generate_password_hash
from ..utils import db
import os
from dotenv import load_dotenv
from ..models.link import qr_code_folder_path

load_dotenv()


def empty_qr_folder(folder_path):
    # Iterate over the contents of the folder
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        # Check if the current item is a file
        if os.path.isfile(file_path):
            os.remove(file_path)  # Remove the file

    print(f"Folder '{folder_path}' emptied.")


def create_default_admin():
    admin_password = os.getenv("ADMIN_DEFAULT_PWD")

    """creates an admin"""
    admin = User(
        email="osquaregtech@gmail.com",
        password_hash=generate_password_hash(admin_password),
        is_admin=True,
    )
    admin.save_to_db()


def drop_create_all():
    db.drop_all()
    db.create_all()
    create_default_admin()
    empty_qr_folder(qr_code_folder_path)
