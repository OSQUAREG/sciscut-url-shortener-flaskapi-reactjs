from flask_restx import Namespace

auth_ns = Namespace(name="Auth Namespace", description="Authentication Operations")

user_ns = Namespace(name="User Namespace", description="User Operations")

links_ns = Namespace(name="Links Namespace", description="Operations on Links")

admin_users_ns = Namespace(name="Admin Namespace for Users", description="Operation on Users by Admin")

admin_links_ns = Namespace(name="Admin Namespace for Links", description="Operations on Links by Admin")