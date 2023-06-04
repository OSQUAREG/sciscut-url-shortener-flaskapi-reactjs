from ..utils import db, DB_Func
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
from flask_login import UserMixin


class User(db.Model, DB_Func, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    date_created = db.Column(db.Date, default=datetime.now)
    date_modified = db.Column(db.Date, onupdate=datetime.now)

    links = db.relationship('Link', backref="user")

    def __repr__(self):
        return f"<User: {self.email}>"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.username = self.generate_username()
        self.password_hash = self.generate_pwd_hash()
        
    def generate_username(self):
        username = self.email.split('@')[0]
        search = username + "@%"
        count = User.query.filter(User.email.like(search)).count()
        if count > 0:
            return username + f"{count + 1}"
        return username

    def check_pwd_hash(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_pwd_hash(self, password):
        return generate_password_hash(password)

    def check_email(self, email):
        email = self.query.filter_by(email=email).first()
        return True if email else False

    def check_username(self, username):
        username = self.query.filter_by(username=username).first()
        return True if username else False
