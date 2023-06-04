from flask_restx import Namespace

users_ns = Namespace(name="Users Namespace", description="Operations on Users")

links_ns = Namespace(name="Links Namespace", description="Operations on Links")

admin_users_ns = Namespace(name="Admin Namespace for Users", description="Operation on Users by Admin")

admin_links_ns = Namespace(name="Admin Namespace for Links", description="Operations on Links by Admin")