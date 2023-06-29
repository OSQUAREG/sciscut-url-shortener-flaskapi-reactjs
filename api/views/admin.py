# from http import HTTPStatus
# from flask_jwt_extended import current_user, jwt_required
# from flask_limiter import ExemptionScope
# from flask_restx import Namespace, Resource, abort
# from ..models import User, Link
# from ..utils import limiter, cache
# from . import admin_users_ns, admin_links_ns
# from ..serializers.user import user_response_model, user_update_model
# from ..serializers.link import link_response_model, update_link_model


# """ADMIN OPERATIONS ON USERS"""
# @admin_users_ns.route("/")
# class AdminGetAllUsers(Resource):
#     @admin_users_ns.marshal_with(user_response_model)
#     @admin_users_ns.doc(description="Retrieve All Users (Admin Only)")
#     @jwt_required()
#     def get(self):
#         """Get All Users (Admin only)"""
#         if not current_user.is_admin:
#             abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

#         users = User.get_all()
#         message = f"All {len(users)} Users retrieved successfully."
#         response = {"message": message, "data": users}
#         return response, HTTPStatus.OK


# @admin_users_ns.route("/<int:user_id>", doc={"params": {"user_id": "User ID"}})
# class AdminGetUpdateDeleteUser(Resource):
#     @admin_users_ns.marshal_with(user_response_model)
#     @admin_users_ns.doc(description="Retrieve Single User (Admin Only)")
#     @jwt_required()
#     def get(self, user_id):
#         """Get User by Id (Admin only)"""
#         if not current_user.is_admin:
#             abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

#         user = User.get_by_id(user_id)
#         message = f"User '{user.username}' retrieved successfully."
#         response = {"message": message, "data": user}
#         return response, HTTPStatus.OK

#     @admin_users_ns.expect(user_update_model)
#     @admin_users_ns.expect()
#     @admin_users_ns.marshal_with(user_response_model)
#     @admin_users_ns.doc(description="Update Single User (Admin Only)")
#     @jwt_required()
#     def put(self, user_id):
#         """Update User by Id (Admin only)"""
#         if not current_user.is_admin:
#             abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

#         user = User.get_by_id(user_id)
#         data = admin_users_ns.payload

#         # validates that the username is not in use
#         if user.username != data.get('username') and user.check_username(data.get('username')):
#             abort(HTTPStatus.CONFLICT, message="Username already exist.")
#         # update username
#         user.username = data.get('username') if data.get('username') else user.username

#         # validates that the username is not in use.
#         if user.email != data.get('email') and user.check_email(data.get('email')):
#             abort(HTTPStatus.CONFLICT, message="Email already exist.")
#         # updates email
#         user.email = data.get('email') if data.get('email') else user.email

#         user.update_db()
#         message = f"User '{user.username}' updated successfully."
#         response = {"message": message, "data": user}
#         return response, HTTPStatus.OK

#     @admin_users_ns.doc(description="Delete Single User (Admin Only)")
#     @jwt_required()
#     def delete(self, user_id):
#         """Delete User by Id (Admin only)"""
#         if not current_user.is_admin:
#             abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

#         user = User.get_by_id(user_id)
#         user.delete_from_db()
#         response = f"User '{user.username}' deleted successfully."
#         return response, HTTPStatus.OK


# """ADMIN OPERATION ON LINKS"""
# @admin_links_ns.route("/")
# class AdminGetAllLinks(Resource):
#     @limiter.exempt(flags=ExemptionScope.APPLICATION)
#     @admin_links_ns.marshal_with(link_response_model)
#     @admin_links_ns.doc(description="Retrieve All Links (Admin Only)")
#     # @jwt_required()
#     def get(self):
#         """Get All Links (Admin only)"""
#         # if not current_user.is_admin:
#         #     abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

#         links = Link.get_all()
#         message = f"All {len(links)} links retrieved successfully."
#         response = {"message": message, "data": links}
#         return response, HTTPStatus.OK

# @admin_links_ns.route("/<int:user_id>/")
# class AdminGetUserLinks(Resource):
#     @admin_links_ns.marshal_with(link_response_model)
#     @admin_users_ns.doc(description="Retrieve Specific User Links (Admin Only)")
#     @jwt_required()
#     def get(self, user_id):
#         """Get Specific User Links (Admin only)"""
#         if not current_user.is_admin:
#             abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

#         user = User.get_by_id(user_id)
#         user_links = Link.get_by_user_id(user_id)
#         message = f"User {user.username}'s {len(user_links)} links retireved successfully."
#         response = {"message": message, "data": user_links}
#         return response, HTTPStatus.OK
