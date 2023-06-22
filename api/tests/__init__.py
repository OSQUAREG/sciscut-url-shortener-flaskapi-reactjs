import unittest
from flask_jwt_extended import create_access_token
from ..models import User, Link
from werkzeug.security import generate_password_hash
from .. import create_app
from ..config.config import config_dict
from ..utils import db


class UnitTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(config=config_dict["test"])
        self.app_ctxt = self.app.app_context()
        self.app_ctxt.push()
        self.client = self.app.test_client()
        db.create_all()

    def tearDown(self):
        db.drop_all
        self.app_ctxt.pop()
        self.app = None
        self.client = None


def get_auth_token_headers(identity):
    token = create_access_token(identity=identity)
    headers = {"Authorization": f"Bearer {token}"}
    return headers


"""FUNCTIONS TO CREATE SINGLE RECORD DATA"""
def create_test_admin():
    """creates a test admin"""
    test_admin = User(
        email="test_admin@test.com",
        password_hash=generate_password_hash("password"),
        is_admin=True,
    )
    test_admin.save_to_db()
    return test_admin


def create_test_user():
    """creates a test user"""
    test_user = User(
        email="test_user@test.com",
        password_hash=generate_password_hash("password"),
        is_admin=False,
    )
    test_user.save_to_db()
    return test_user


def add_test_link():
    """adds a test long URL to be shortened."""
    test_link = Link(
        title="Test Link",
        long_url="http://example.com",
        short_url="TesT",
        is_custom=True,
        user_id=1,
    )
    test_link.save_to_db()
    return test_link


"""CREATING MUTLIPE DATA"""
def add_multiple_test_links():
    """adds multiple test links to be shortened."""
    test_links = []
    
    test_link1 = Link(
        title="Test Link1",
        long_url="http://example1.com",
        short_url="TesT1",
        is_custom=True,
        user_id=1,
    )

    test_link2 = Link(
        title="Test Link2",
        long_url="http://example2.com",
        short_url="TesT",
        is_custom=False,
        user_id=1,
    )

    test_link3 = Link(
        title="Test Link3",
        long_url="http://example3.com",
        short_url="TesT3",
        is_custom=True,
        user_id=2,
    )
    
    test_link1.save_to_db()
    test_link2.save_to_db()
    test_link3.save_to_db()

    test_links.append(test_link1)
    test_links.append(test_link2)
    test_links.append(test_link3)

    return test_links


def create_multiple_test_users():
    """creates multiple test users"""
    test_users = []
    
    test_user1 = User(
        email="test_user1@test.com",
        password_hash=generate_password_hash("password"),
        is_admin=False,
    )
    
    test_user2 = User(
        email="test_user2@test.com",
        password_hash=generate_password_hash("password"),
        is_admin=False,
    )
    test_user3 = User(
        email="test_user3@test.com",
        password_hash=generate_password_hash("password"),
        is_admin=False,
    )
    
    test_user1.save_to_db()
    test_user2.save_to_db()
    test_user3.save_to_db()

    test_users.append(test_user1)
    test_users.append(test_user2)
    test_users.append(test_user3)
    
    return test_users