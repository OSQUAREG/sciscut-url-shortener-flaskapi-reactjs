from flask_restx import Namespace

users_ns = Namespace(name="Users Namespace", description="Operations on Users")

links_ns = Namespace(name="Links Namespace", description="Operations on Links")