from flask_restx import Resource, abort
from ..blocklist import BLOCKLIST
from ..models import User
from ..utils import cache, limiter
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, current_user, get_jwt, get_jwt_identity, jwt_required
from ..serializers.user import user_model, user_response_model, change_password_model, user_update_model
from ..views import users_ns
from http import HTTPStatus


@users_ns.route("signup/")
class UserSignup(Resource):
    @limiter.limit("10/minute")
    @users_ns.expect(user_model)
    @users_ns.marshal_with(user_response_model)
    def post(self):
        """Sign up a User"""
        data = users_ns.payload
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

        message = f"New User '{new_user.username}' signed up successfully."
        response = {"message": message, "data": new_user}
        return response, HTTPStatus.CREATED


@users_ns.route("login/")
class UserLogin(Resource):
    @users_ns.expect(user_model)
    @users_ns.doc(description="User Login: Generates JWT Tokens")
    def post(self):
        """Login a User: Generates JWT Tokens"""
        data = users_ns.payload
        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()
        if user and user.check_pwd_hash(password):
            access_token = create_access_token(identity=user.email)
            refresh_token = create_refresh_token(identity=user.email)

            message = f"User '{user.username}' logged in successfully."
            response = {
                "message": message,
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
            return response, HTTPStatus.OK
        else:
            message = "Invalid email or password."
            return message, HTTPStatus.UNAUTHORIZED


@users_ns.route("refresh/")
class TokenRefresh(Resource):
    @limiter.limit("10/minute")
    @cache.cached(timeout=50)
    @users_ns.doc(description="Refresh JWT Access Token")
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


@users_ns.route("logout/")
class UserLogout(Resource):
    @users_ns.doc(description="Logout: Block JWT Token")
    @jwt_required()
    def post(self):
        """Logout a User: Block Access Token"""
        token = get_jwt()
        jti = token["jti"]
        BLOCKLIST.add(jti)

        return {"message": "Logged Out Successfully!"}


@users_ns.route("change-password/")
class UserPasswordChange(Resource):
    @limiter.limit("1/minute")
    @cache.cached(timeout=50)
    @users_ns.expect(change_password_model)
    @users_ns.doc(description="Current User Password Change")
    @jwt_required()
    def patch(self):
        """Change Password"""
        data = users_ns.payload
        email = get_jwt_identity()
        user = User.query.filter_by(email=email).first()
        
        old_password = data.get("old_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if new_password == confirm_password:
            if user and user.check_pwd_hash(old_password):
                user.password_hash = generate_password_hash(new_password)
                user.modified_by = current_user.username
                user.update_db()

                # logs out current user
                token = get_jwt()
                jti = token["jti"]
                BLOCKLIST.add(jti)

                response = {"message": "Password Changed Successfully. Please Log-in Again"}
                return response, HTTPStatus.OK

            response = {"message": "Unauthorized Request. Password Incorrect."}
            return response, HTTPStatus.UNAUTHORIZED
        
        response = {"message": "New Password and Confirm Password Mismatched"}
        return response, HTTPStatus.CONFLICT


@users_ns.route("user/")
class GetSingleUser(Resource):
    @limiter.limit("10/minute")
    @cache.cached(timeout=50)
    @users_ns.marshal_with(user_response_model)
    @users_ns.doc(description="Retrieve Any User or Current User")
    @jwt_required()
    def get(self):
        """Get Current User"""
        message = f"User '{current_user.username}' retrieved successfully."
        response = {"message": message, "data": current_user}
        return response, HTTPStatus.OK

    @limiter.limit("10/minute")
    @cache.cached(timeout=50)
    @users_ns.expect(user_update_model)
    @users_ns.marshal_with(user_response_model)
    @users_ns.doc(description="Retrieve Any User or Current User")
    @jwt_required()
    def put(self):
        """Update Current User"""
        old_email = current_user.email
        data = users_ns.payload

        # validates that the username is not in use
        if current_user.username != data.get('username') and current_user.check_username(data.get('username')):
            abort(HTTPStatus.CONFLICT, message="Username already exist.")
        # update username
        current_user.username = data.get('username') if data.get('username') else current_user.username
        
        # validates that the username is not in use.
        if current_user.email != data.get('email') and current_user.check_email(data.get('email')):
            abort(HTTPStatus.CONFLICT, message="Email already exist.")
        # updates email
        current_user.email = data.get('email') if data.get('email') else current_user.email

        # checks if email is changed and logs out user.
        if current_user.email != old_email:
            current_user.update_db()
            # logs out current user
            BLOCKLIST.add(get_jwt()["jti"])
            
            message = f"User '{current_user.username}' updated successfully. Email changed, please log-in again"
            response = {"message": message, "data": current_user}
            return response, HTTPStatus.OK

        current_user.update_db()
        message = f"User '{current_user.username}' updated successfully."
        response = {"message": message, "data": current_user}
        return response, HTTPStatus.OK

    @limiter.limit("1/minute")
    @cache.cached(timeout=50)
    @users_ns.doc(description="Delete Current User")
    @jwt_required()
    def delete(self):
        """Delete Current User"""
        current_user.delete_from_db()
        message = "User deleted successfully."
        return message, HTTPStatus.NO_CONTENT
    