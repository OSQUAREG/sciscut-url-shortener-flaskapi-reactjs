from flask_restx import Resource, abort
from ..blocklist import BLOCKLIST
from ..models import User
from ..utils import cache, limiter
from werkzeug.security import generate_password_hash
from flask_jwt_extended import current_user, get_jwt, get_jwt_identity, jwt_required
from ..serializers.user import (
    user_response_model,
    change_password_model,
    user_update_model,
)
from ..views import user_ns
from http import HTTPStatus


@user_ns.route("")
class GetUpdateCurrentUser(Resource):
    @limiter.exempt
    @cache.cached(timeout=50)
    @user_ns.marshal_with(user_response_model)
    @user_ns.doc(description="Retrieve Any User or Current User")
    @jwt_required()
    def get(self):
        """Get Current User"""
        message = f"User '{current_user.username}' retrieved successfully."
        response = {"message": message, "data": current_user}
        return response, HTTPStatus.OK

    @limiter.limit("10/minute")
    @cache.cached(timeout=50)
    @user_ns.expect(user_update_model)
    @user_ns.marshal_with(user_response_model)
    @user_ns.doc(description="Retrieve Any User or Current User")
    @jwt_required()
    def put(self):
        """Update Current User"""
        old_email = current_user.email
        data = user_ns.payload

        user = User.query.filter_by(email=get_jwt_identity()).first()
        if not (user and user.check_pwd_hash(data.get("password"))):
            abort(
                HTTPStatus.UNAUTHORIZED,
                message={"message": "Unauthorized Request. Password Incorrect."},
            )

        # validate and update username
        if current_user.username != data.get(
            "username"
        ) and current_user.check_username(data.get("username")):
            abort(HTTPStatus.CONFLICT, message="Username already exist.")
        current_user.username = (
            data.get("username") if data.get("username") else current_user.username
        )

        # validates and update email
        if current_user.email != data.get("email") and current_user.check_email(
            data.get("email")
        ):
            abort(HTTPStatus.CONFLICT, message="Email already exist.")
        current_user.email = (
            data.get("email") if data.get("email") else current_user.email
        )

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

    # @limiter.limit("1/minute")
    # @cache.cached(timeout=50)
    # @user_ns.doc(description="Delete Current User")
    # @jwt_required()
    # def delete(self):
    #     """Delete Current User"""
    #     current_user.delete_from_db()
    #     message = f"User '{current_user.username}' deleted successfully."
    #     return message, HTTPStatus.OK


@user_ns.route("/change-password")
class UserPasswordChange(Resource):
    @limiter.limit("1/minute")
    @cache.cached(timeout=30)
    @user_ns.expect(change_password_model)
    @user_ns.doc(description="Current User Password Change")
    @jwt_required()
    def patch(self):
        """Change Password"""
        data = user_ns.payload
        old_password = data.get("old_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")
        # checks if new password confirmation is matched
        if new_password != confirm_password:
            abort(
                HTTPStatus.CONFLICT,
                message={"message": "New Password and Confirm Password Mismatched"},
            )
        # check if user exist and old password is correct
        user = User.query.filter_by(email=get_jwt_identity()).first()
        if not (user and user.check_pwd_hash(old_password)):
            abort(
                HTTPStatus.UNAUTHORIZED,
                message={"message": "Unauthorized Request. Password Incorrect."},
            )

        user.password_hash = generate_password_hash(new_password)
        user.modified_by = current_user.username
        user.update_db()

        # logs out current user
        token = get_jwt()
        jti = token["jti"]
        BLOCKLIST.add(jti)

        response = {"message": "Password Changed Successfully. Please Log-in Again"}
        return response, HTTPStatus.OK
