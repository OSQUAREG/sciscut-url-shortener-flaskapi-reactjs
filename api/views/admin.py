from http import HTTPStatus
from flask_jwt_extended import current_user, jwt_required
from flask_restx import Namespace, Resource, abort
from ..models import User, Link
from . import admin_users_ns, admin_links_ns
from ..serializers.user import user_response_model


@admin_users_ns.route("/")
class AdminGetAllUsers(Resource):
    @admin_users_ns.marshal_with(user_response_model)
    @admin_users_ns.doc(description="Retrieve All Users (Admin Only)")
    @jwt_required()
    def get(self):
        """Get All Users (Admin only)"""
        if not current_user.is_admin:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")
            
        users = User.get_all()        
        message = f"All {len(users)} Users retrieved successfully."
        response = {"message": message, "data": users}
        return response, HTTPStatus.OK


@admin_users_ns.route("/<int:user_id>", doc={"params": {"user_id": "User ID"}})
class AdminGetUpdateDeleteUser(Resource):
    @admin_users_ns.marshal_with(user_response_model)
    @admin_users_ns.doc(description="Retrieve Single User (Admin Only)")
    @jwt_required()
    def get(self, user_id):
        """Get User by Id (Admin only)"""
        if not current_user.is_admin:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        user = User.get_by_id(user_id)
        message = f"User '{user.username}' retrieved successfully."
        response = {"message": message, "data": user}
        return response, HTTPStatus.OK

    @admin_users_ns.marshal_with(user_response_model)
    @admin_users_ns.doc(description="Update Single User (Admin Only)")
    @jwt_required()
    def put(self, user_id):
        """Update User by Id (Admin only)"""
        pass

    @admin_users_ns.doc(description="Delete Single User (Admin Only)")
    @jwt_required()
    def delete(self, user_id):
        """Delete User by Id (Admin only)"""
        if not current_user.is_admin:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        user = User.get_by_id(user_id)
        user.delete_from_db()
        response = f"User '{user.username}' retrieved successfully."
        return response, HTTPStatus.NO_CONTENT




@admin_links_ns.route("/")
class AdminGetAllLinks(Resource):
    def get(self):
        """Get all links by admin"""
        pass