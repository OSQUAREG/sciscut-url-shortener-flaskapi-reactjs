from flask_restx import Resource, abort
from ..blocklist import BLOCKLIST
from ..models import User
from ..utils import cache, limiter
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, get_jwt_identity, jwt_required
from ..serializers.user import user_model, user_response_model, user_resp_logged_model
from ..views import auth_ns
from http import HTTPStatus


@auth_ns.route("/signup")
class UserSignup(Resource):
    @limiter.limit("10/minute")
    @auth_ns.expect(user_model)
    @auth_ns.marshal_with(user_response_model)
    def post(self):
        """Sign up a User"""
        data = auth_ns.payload
        email = data.get("email")
        password = data.get("password")

        # Checking if email already existsz
        email_exist = User.query.filter_by(email=email).first()
        if email_exist:
            abort(HTTPStatus.CONFLICT, "Email already in use")
        if len(password) < 8:
            abort(HTTPStatus.BAD_REQUEST, "Password must be at least 8 characters")

        new_user = User(email=email, password_hash=generate_password_hash(password))
        new_user.save_to_db()

        message = f"New User '{new_user.username}' signed up successfully. Please login."
        response = {"message": message, "data": new_user}
        return response, HTTPStatus.CREATED


@auth_ns.route("/login")
class UserLogin(Resource):
    @auth_ns.expect(user_model)
    @auth_ns.marshal_with(user_resp_logged_model)
    @auth_ns.doc(description="User Login: Generates JWT Tokens")
    def post(self):
        """Login a User: Generates JWT Tokens"""
        data = auth_ns.payload
        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()
        if not(user and user.check_pwd_hash(password)):
            abort(HTTPStatus.UNAUTHORIZED, message="Invalid email or password.")
            
        access_token = create_access_token(identity=user.email)
        refresh_token = create_refresh_token(identity=user.email)

        message = f"User '{user.username}' logged in successfully."
        response = {
            "message": message,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "data": user
        }
        return response, HTTPStatus.CREATED


@auth_ns.route("/refresh")
class TokenRefresh(Resource):
    @limiter.limit("10/minute")
    @cache.cached(timeout=50)
    @auth_ns.doc(description="Refresh JWT Access Token")
    @jwt_required(refresh=True)
    def post(self):
        """Refresh JWT Access Token"""
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)

        message = f"Refresh successful."
        response = {
                "message": message,
                "access_token": access_token,
            }
        return response, HTTPStatus.OK


@auth_ns.route("/logout")
class UserLogout(Resource):
    @auth_ns.doc(description="Logout: Block JWT Token")
    @jwt_required()
    def post(self):
        """Logout a User: Block Access Token"""
        token = get_jwt()
        jti = token["jti"]
        BLOCKLIST.add(jti)

        return {"message": "Logged Out Successfully!"}
