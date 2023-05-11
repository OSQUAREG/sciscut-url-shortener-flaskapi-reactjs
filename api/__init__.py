from flask import Flask
from .config.config import config_dict

def create_app(config=config_dict["dev"]):
    app = Flask(__name__)
    app.config.from_object(config)
    return app
