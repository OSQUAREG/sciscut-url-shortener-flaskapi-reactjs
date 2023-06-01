from http import HTTPStatus
from flask import Flask, render_template, url_for
from flask_restx import Api, Namespace
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from .blocklist import BLOCKLIST
from .models import User, Link
from .utils import db, drop_create_all
from .config.config import config_dict
from .views.user import users_ns
from .views.link import links_ns
from flask_login import LoginManager
from flask_admin import Admin, menu
from flask_admin.contrib.sqla import ModelView
from api.admin.admin_views import MyAdminIndexView, MyModelView, LogoutMenuLink

def create_app(config=config_dict["dev"]):
    app = Flask(__name__, template_folder="api/admin/templates")
    app.config.from_object(config)
    db.init_app(app)

    # Initialize flask-admin
    app.config["FLASK_ADMIN_SWATCH"] = "united"
    admin = Admin(app, name='Admin: Scissor-URL Shortener API', template_mode='bootstrap3', index_view=MyAdminIndexView(), base_template="templates/my_master.html")

    admin.add_view(MyModelView(User, db.session))
    admin.add_view(MyModelView(Link, db.session))
    admin.add_link(LogoutMenuLink(name='Logout'))

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
        title="Scissor - URL Shortener API",
        description="This is a URL Shortener API build with Flask RESTX in Python",
        version="1.0",
        authorizations=authorizations,
        security="Bearer Auth",
        errors=Flask.errorhandler,
    )

    api.add_namespace(users_ns, path="/")
    api.add_namespace(links_ns, path="/")

    @app.shell_context_processor
    def make_shell_context():
        return {
            "db": db,
            "User": User,
            "Link": Link,
            "drop_create_all": drop_create_all,
        }

    @app.route("/home")
    def index():
        return render_template("index.html")

    # Flask views
    @app.route('/admin')
    def admin_index():
        return render_template('index.html')

    return app
    