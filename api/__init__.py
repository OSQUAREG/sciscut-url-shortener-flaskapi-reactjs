from http import HTTPStatus
from flask import Flask, jsonify, render_template, send_from_directory
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from .blocklist import BLOCKLIST
from .models import User, Link, ClickAnalytic
from .utils import db, cache, limiter
from .utils.create_defaults import (
    drop_create_all,
    create_default_admin,
    empty_qr_folder,
    qr_code_folder_path,
)
from .config.config import config_dict
from .views.auth import auth_ns
from .views.user import user_ns
from .views.link import links_ns

# from .views.admin import admin_links_ns, admin_users_ns
from flask_login import LoginManager
from flask_admin import Admin, menu
from flask_admin.contrib.sqla import ModelView
from api.admin.admin_views import MyAdminIndexView, MyModelView, LogoutMenuLink
from flask_cors import CORS


def create_app(config=config_dict["dev"]):
    app = Flask(__name__, static_url_path="/", static_folder="./client/build")
    app.config.from_object(config)
    db.init_app(app)
    cache.init_app(app)
    limiter.init_app(app)
    CORS(app)

    # Initialize flask-admin
    app.config["FLASK_ADMIN_SWATCH"] = "united"
    admin = Admin(
        app,
        name="Admin: Sciscut-URL Shortener API",
        template_mode="bootstrap3",
        index_view=MyAdminIndexView(),
        base_template="my_master.html",
    )

    admin.add_view(MyModelView(User, db.session))
    admin.add_view(MyModelView(Link, db.session))
    admin.add_view(MyModelView(ClickAnalytic, db.session))
    admin.add_link(LogoutMenuLink(name="Logout"))

    # Initialize flask-migrate
    migrate = Migrate(app, db)

    # Initialize flask-jwt
    jwt = JWTManager(app)

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(email=identity).one_or_none()

    @jwt.token_in_blocklist_loader
    def check_if_token_in_blacklist(jwt_header, jwt_payload):
        return jwt_payload["jti"] in BLOCKLIST

    @jwt.expired_token_loader
    def my_expired_token_callback(jwt_header, jwt_payload):
        return (
            jsonify(
                {
                    "status": 401,
                    "sub_status": 42,
                    "message": "Your login has expired. Please login again.",
                }
            ),
            401,
        )

    # Initialize flask-login
    login_manager = LoginManager(app)

    @login_manager.user_loader
    def load_user(user_id):
        if user_id is None:
            return HTTPStatus.UNAUTHORIZED
        return db.session.query(User).get(user_id)

    authorizations = {
        "Bearer Auth": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization",
            "description": "Add a JWT token to the header with: <Bearer {JWT token}> to authorize.",
        }
    }

    api = Api(
        app=app,
        title="Sciscut - URL Shortener API",
        description="This is a URL Shortener API build with Flask RESTX in Python.",
        version="1.0",
        authorizations=authorizations,
        security="Bearer Auth",
        errors=Flask.errorhandler,
    )

    api.add_namespace(auth_ns, path="/auth")
    api.add_namespace(user_ns, path="/user")
    api.add_namespace(links_ns, path="/links")
    # api.add_namespace(admin_users_ns, path="/admin/users")
    # api.add_namespace(admin_links_ns, path="/admin/links")

    @app.route("/")
    def index():
        return app.send_static_file("index.html")

    # Serve the QR code image
    @app.route("/api/qr-code/<qr_code_id>")
    def serve_qr_code(qr_code_id):
        qr_code_folder_path = config("QR_CODE_FOLDER_PATH")
        qr_code_img_path = f"{qr_code_folder_path}/{qr_code_id}.png"
        return send_from_directory(app.root_path, qr_code_img_path)

    @app.errorhandler(404)
    def not_found(error):
        return app.send_static_file("index.html")

    @app.errorhandler(500)
    def server_error(error):
        return app.send_static_file("index.html")

    @app.route("/home")
    def home():
        return render_template("index.html")

    # Flask Admin Views
    @app.route("/")
    def admin_index():
        return render_template("index.html")

    @app.shell_context_processor
    def make_shell_context():
        return {
            "db": db,
            "User": User,
            "Link": Link,
            "ClickAnalytic": ClickAnalytic,
            "drop_create_all": drop_create_all,
            "create_default_admin": create_default_admin,
            "empty_qr_folder": empty_qr_folder,
            "qr_folder": qr_code_folder_path,
        }

    return app
