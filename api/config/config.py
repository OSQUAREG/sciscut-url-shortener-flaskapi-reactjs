import os
import re
from datetime import timedelta
from decouple import config

base_dir = os.path.dirname(os.path.realpath(__file__))


class Config:
    SECRET_KEY = config("SECRET_KEY", "secret")
    JWT_SECRET_KEY = config("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=120)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(minutes=60)
    SQLALCHEMY_TRACK_MODIFICATION = False
    SQLALCHEMY_ECHO = True
    CACHE_TYPE = "SimpleCache"


class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(base_dir, "urls.db")
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite://"  # for in-memory database
    SQLALCHEMY_ECHO = False


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = config("DATABASE_URL")
    DEBUG = config("DEBUG", False, cast=bool)
    SQLALCHEMY_ECHO = False


config_dict = dict(dev=DevelopmentConfig, test=TestingConfig, prod=ProductionConfig)
