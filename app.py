from flask import Flask
import validators
from flask import jsonify
from flask import request

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
jwt = JWTManager(app)


@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    if username != "test" or password != "test":
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)


@app.route("/optionally_protected", methods=["GET"])
@jwt_required(optional=True)
def optionally_protected():
    current_identity = get_jwt_identity()
    print(current_identity)
    if current_identity:
        return jsonify(logged_in_as=current_identity)
    else:
        return jsonify(logged_in_as="anonymous user")

@app.route('/')
def home():
    return "Hello World"

def checker():
    url = "twitter.in"
    if not (url.startswith("http://") or url.startswith("https://")):
        print(type(f"\n http://{url}"))
        print(f"\n http://" + url)
    # if validators.url(url) or validators.url("http://" + url) or validators.url("https://" + url):
    if validators.url(url) or validators.url(f"http://{url}") or validators.url(f"https://{url}"):
        print("\n Valid URL \n")
    else:
        print("\n Invalid URL \n")

checker()

if __name__ == '__main__':
    app.run(debug=True)