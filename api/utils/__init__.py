from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=naming_convention)

db = SQLAlchemy()
cache = Cache()
limiter = Limiter(
    get_remote_address,
    default_limits=[
        "10 per day", 
        "3 per hour",
    ],
    storage_uri="memory://",
)


class DB_Func:
    def save_to_db(self):
        """Saves new data to the database"""
        db.session.add(self)
        db.session.commit()

    def delete_from_db(self):
        """Deletes data from the database"""
        db.session.delete(self)
        db.session.commit()

    def update_db(self):
        """Commits changes to the database"""
        db.session.commit()

    @classmethod
    def get_by_id(cls, id):
        """Queries and gets data by Id from a specific table in the database"""
        return cls.query.get_or_404(id)

    @classmethod
    def get_all(cls):
        """Gets all data from a table in the database"""
        return cls.query.all()


def drop_create_all():
    db.drop_all()
    db.create_all()
