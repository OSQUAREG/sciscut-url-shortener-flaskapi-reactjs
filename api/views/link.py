from flask import redirect
from flask_restx import Resource, abort
from ..models import Link
from flask_jwt_extended import current_user, jwt_required
from ..serializers.link import link_response_model, add_link_model, update_link_model
from ..views import links_ns
from http import HTTPStatus


@links_ns.route("shorten/")
class ShortenLink(Resource):
    @links_ns.expect(add_link_model)
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Shorten Long URL Links")
    @jwt_required(optional=True)
    def post(self):
        """Shorten Long URL Links"""
        data = links_ns.payload
        # Checks if URL already exist for current user
        link = Link.get_link_by_long_url_user_id(data.get("long_url"), current_user.id)
        if link:
            message = f"You already shortened the provided URL."
            response = {"message": message, "data": link}
            return response, HTTPStatus.OK

        new_link = Link(
            title=data.get("title"),
            long_url=data.get("long_url"),
            user_id=current_user.id,
            qr_code=data.get("qr_code"),
        )
        # checks if URL is valid
        if new_link.validate_long_url():
            # checks if title already exists
            if new_link.validate_title_by_user(new_link.title, current_user.id):
                abort(HTTPStatus.CONFLICT, message=f"URL Title '{new_link.title}' already exists")
                
            # checks if short custom url is provided and if not generates one.
            new_link.short_url, new_link.is_custom = (data.get("short_url"), True) if data.get("short_url") else (new_link.generate_short_url(), False)
            
            # checks if short custom url exists.
            if new_link.validate_short_url_by_user(new_link.short_url, current_user.id):
                abort(HTTPStatus.CONFLICT, message="The provided custom URL already exists.")
            
            new_link.save_to_db()

            # if QR Code is requested
            if new_link.qr_code:
                new_link.generate_qr_code()

            message = f"The '{new_link.title}' URL shortened successfully."
            response = {"message": message, "data": new_link}
            return response, HTTPStatus.CREATED
        else:
            response = {"message": "Invalid URL"}
            return response, HTTPStatus.BAD_REQUEST


@links_ns.route("<short_url>/")
class RedirectLink(Resource):
    @links_ns.doc(
        description="Redirect Shortened URL", params={"short_url": "Shortened or Customized URL"}
    )
    def get(self, short_url):
        """Redirect Shortened URL to the Long URL"""
        link = Link.get_link_by_short_url(short_url)
        link.visits += 1
        link.update_db()

        message = "URL Redirected successfully."
        response = {"message": message, "url": link.long_url}
        return response, HTTPStatus.OK
        # return redirect(link.long_url)


@links_ns.route("reset/<int:link_id>/")
class ResetLink(Resource):
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Reset Shortened URL", params={"link_id": "Link ID"})
    @jwt_required()
    def patch(self, link_id):
        """Reset the Short URL"""
        link = Link.get_by_id(link_id)
        # checks if current user created the shortened link
        if not current_user.id == link.user_id:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")
            
        link.short_url = link.generate_short_url()
        link.update_db()

        message = "Short URL reset successfully."
        response = {"message": message, "data": link}
        return response, HTTPStatus.OK


@links_ns.route("qr_code/<int:link_id>/")
class GenerateQRCode(Resource):
    @links_ns.doc(description="Generate Link QR Code", params={"link_id": "Link ID"})
    @jwt_required()
    def patch(self, link_id):
        """Generate QR Code for the Long URL"""
        
        link = Link.get_by_id(link_id)
        # checks if current user created the shortened link
        if not current_user.id == link.user_id:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")
            
        link.qr_code = True
        link.modified_by = current_user.username
        link.update_db()
        link.generate_qr_code()

        message = f"QR Code for '{link.title}' URL generated successfully."
        return {"message": message}, HTTPStatus.OK


@links_ns.route("links/")
class GetAllLinks(Resource):
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Retrieve All Links (Admin Only)")
    @jwt_required()
    def get(self):
        """Get All Links (admin only)"""
        if not current_user.is_admin:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")
            
        links = Link.get_all()
        message = f"All {len(links)} Links retrieved succesfully"
        response = {"message": message, "data": links}
        return response, HTTPStatus.OK


@links_ns.route("user/links/")
class GetUserLinks(Resource):
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Retrieve User Links")
    @jwt_required()
    def get(self):
        """Get User Links"""
        links = Link.get_by_user_id(current_user.id)

        message = f"{current_user.username}'s {len(links)} links retrieved succesfully"
        response = {"message": message, "data": links}
        return response, HTTPStatus.OK


@links_ns.route("links/<int:link_id>")
class GetUpdateDeleteLink(Resource):
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Retrieve Single Link", params={"link_id": "Link ID"})
    @jwt_required()
    def get(self, link_id):
        """Get Single Link by Id"""
        link = Link.get_by_id(link_id)
        # checks if current user created the shortened link
        if not current_user.id == link.user_id:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        message = f"'{link.title}' link retrieved successfully"
        response = {"message": message, "data": link}
        return response, HTTPStatus.OK

    @links_ns.expect(update_link_model)
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Update Single Link", params={"link_id": "Link ID"})
    @jwt_required()
    def put(self, link_id):
        """Update Single Link by ID"""
        link = Link.get_by_id(link_id)
        # checks if current user created the shortened link
        if not current_user.id == link.user_id:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        data = links_ns.payload

        """Validating and updating the long URL"""
        # checks if new long URL is given and if it matches the current long URL
        if data.get("long_url") and data.get("long_url") != link.long_url:
            link_exist = Link.get_link_by_long_url_user_id(data.get("long_url"), current_user.id)
            # then checks if the long URL is already shortened for user
            if link_exist:
                message="The provided long URL is already shortened."
                response={"message": message, "data": link_exist}
                return response, HTTPStatus.OK
            else:
                # updates the long URL and resets 'visits' to 0
                link.long_url, link.visits = data.get("long_url"), 0
                # validate that the long URL is a valid URL
                if not link.validate_long_url():
                    abort(HTTPStatus.BAD_REQUEST, message="Invalid long URL")
        else:
            # retains the current long URL.
            link.long_url = link.long_url

        """Validating and updating the URL title"""
        # checks if new title is given and if it matches the current title
        if data.get("title") and data.get("title") != link.title:
            # validates that the title does not exist already for user
            if link.validate_title_by_user(data.get("title"), current_user.id):
                abort(HTTPStatus.CONFLICT, message="Title already exist.")
            else:
                # updates the title
                link.title = data.get("title")
        else:
            # retains the current title
            link.title = link.title

        """Validating and updating the short URL"""
        # checks if custom short URL is given and if it matches the current short URL and if is_custom is True
        if data.get("short_url") and data.get("short_url") != link.short_url and data.get("is_custom") == True:
            # then checks if the given custom short URL matches any existing short URL for user
            if link.validate_short_url_by_user(data.get("short_url"), current_user.id):
                abort(HTTPStatus.CONFLICT, message="custom URL already exist.")
            else:
                # updates the short URL and is_custom set to True
                link.short_url, link.is_custom = data.get("short_url"), True
        # then checks if is_custom is False and generates a short URL
        elif data.get("is_custom") == False:
            link.short_url, link.is_custom = link.generate_short_url(), False
        else:
            # retains the current short URL and is_custom
            link.short_url, link.is_custom = link.short_url, link.is_custom
            
        link.update_db()

        message = f"'{link.title}' link updated successfully"
        response = {"message": message, "data": link}
        return response, HTTPStatus.OK

    @links_ns.doc(description="Delete Single Link", params={"link_id": "Link ID"})
    @jwt_required()
    def delete(self, link_id):
        """Delete Single Link by ID"""
        link = Link.get_by_id(link_id)
        # checks if current user created the shortened link
        if not current_user.id == link.user_id:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        link.delete_from_db()
        message = "Link deleted successfully."
        return message, HTTPStatus.NO_CONTENT
