import geocoder
from flask import request
from flask_restx import Resource, abort
from ..models import Link, ClickAnalytic
from ..utils import cache, limiter
from flask_jwt_extended import current_user, jwt_required
from ..serializers.link import (
    link_response_model,
    add_link_model,
    update_link_model,
    link_analytics_response_model,
)
from ..views import links_ns
from http import HTTPStatus
from ..utils import cache, limiter
from ..utils import db


@links_ns.route("/shorten")
class ShortenLink(Resource):
    @limiter.limit("10/minute")
    @cache.cached(timeout=50)
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
            print("link found for:", current_user.id)
        else:
            print("link not found for:", current_user.id)

        if link:
            message = f"You already shortened the provided long UR. See title: '{link.title if link.title else link.long_url}'."
            response = {"message": message, "data": link}
            return response, HTTPStatus.OK

        new_link = Link(
            title=data.get("title"),
            long_url=data.get("long_url"),
            user_id=current_user.id,
            qr_code_added=data.get("qr_code_added"),
        )
        # checks if URL is valid
        if new_link.validate_long_url():
            # checks if title already exists only when title is provided
            if new_link.title and new_link.validate_title_by_user(
                new_link.title, current_user.id
            ):
                abort(
                    HTTPStatus.CONFLICT,
                    message=f"URL Title '{new_link.title}' already exists",
                )

            # checks if short custom url is provided and if not generates one.
            new_link.short_url, new_link.is_custom = (
                (data.get("short_url"), True)
                if data.get("short_url")
                else (new_link.generate_short_url(), False)
            )

            # checks if short custom url exists.
            if new_link.validate_short_url_by_user(new_link.short_url, current_user.id):
                abort(
                    HTTPStatus.CONFLICT,
                    message="The provided custom URL already exists.",
                )

            # if QR Code is requested
            if new_link.qr_code_added:
                new_link.generate_qr_code()

            new_link.save_to_db()

            message = f"The '{new_link.title}' URL shortened successfully."
            response = {"message": message, "data": new_link}
            return response, HTTPStatus.CREATED
        else:
            response = {"message": "Invalid URL"}
            return response, HTTPStatus.BAD_REQUEST


@links_ns.route("/<short_url>")
class RedirectLink(Resource):
    # @cache.cached(timeout=50)
    @links_ns.doc(
        description="Redirect Shortened URL",
        params={"short_url": "Shortened or Customized URL"},
    )
    def get(self, short_url: str):
        """Redirect Shortened URL to the Long URL"""
        link = Link.get_link_by_short_url(short_url)
        if link is None:
            abort(HTTPStatus.NOT_FOUND, message="Invalid Short URL")
        link.visits = link.visits + 1
        link.update_db()

        ip_address = request.remote_addr
        location = geocoder.ip(ip_address)

        new_click = ClickAnalytic(
            link_id=link.id,
            user_agent=request.user_agent.string,
            referrer=request.referrer,
            # Geolocation info
            ip_address=ip_address,
            latitude=location.lat if location else None,
            longitude=location.lng if location else None,
            country=location.country if location else None,
            state=location.state if location else None,
            city=location.city if location else None,
            # Device info
            device_type=request.user_agent.platform,
            operating_system=request.user_agent.platform,
            browser=request.user_agent.browser,
        )
        new_click.save_to_db()

        message = f"URL redirected successfully. Visits: {link.visits}. IP Address: {new_click.ip_address}"
        long_url = link.long_url

        response = {"message": message, "data": long_url}
        return response, HTTPStatus.OK


@links_ns.route("/reset/<int:link_id>")
class ResetLink(Resource):
    @limiter.limit("10/minute")
    @cache.cached(timeout=50)
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Reset Shortened URL", params={"link_id": "Link ID"})
    @jwt_required()
    def patch(self, link_id):
        """Reset the Short URL"""
        link = Link.get_by_id(link_id)
        # checks if current user created the shortened link
        if not current_user.id == link.user_id:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        link.reset_short_url()
        link.modified_by = current_user.username
        link.update_db()

        message = "Short URL reset successful."
        response = {"message": message, "data": link}
        return response, HTTPStatus.OK


@links_ns.route("/qr_code/<int:link_id>")
class GenerateQRCode(Resource):
    @limiter.limit("10/minute")
    @cache.cached(timeout=300)
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Generate Link QR Code", params={"link_id": "Link ID"})
    @jwt_required()
    def patch(self, link_id):
        """Generate QR Code for the Long URL"""

        link = Link.get_by_id(link_id)
        # checks if current user created the shortened link
        if not current_user.id == link.user_id:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        link.qr_code_added = True
        link.modified_by = current_user.username
        link.generate_qr_code()
        link.update_db()

        message = f"QR Code for '{link.title}' URL generated successfully."
        response = {"message": message, "data": link}
        return response, HTTPStatus.OK


@links_ns.route("/remove/qr_code/<int:link_id>")
class RemoveQRCode(Resource):
    @limiter.limit("10/minute")
    @cache.cached(timeout=300)
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Remove Link QR Code", params={"link_id": "Link ID"})
    @jwt_required()
    def patch(self, link_id):
        """Remove QR Code for the Long URL"""

        link = Link.get_by_id(link_id)
        # checks if current user created the shortened link
        if not current_user.id == link.user_id:
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        link.qr_code_added = False
        link.modified_by = current_user.username
        link.remove_qr_code()
        link.update_db()

        message = f"QR Code for '{link.title}' URL removed successfully."
        response = {"message": message, "data": link}
        return response, HTTPStatus.OK


@links_ns.route("/user")
class GetCurrentUserLinks(Resource):
    @limiter.exempt
    @cache.cached(timeout=50)
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Retrieve Current User Links")
    @jwt_required()
    def get(self):
        """Get Current User Links"""
        links = Link.get_by_user_id(current_user.id)

        message = f"{current_user.username}'s {len(links)} links retrieved succesfully"
        response = {"message": message, "data": links}
        return response, HTTPStatus.OK


@links_ns.route("/<int:link_id>")
class GetUpdateDeleteLink(Resource):
    @limiter.limit("10/minute")
    # @cache.cached(timeout=50)
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Retrieve Single Link", params={"link_id": "Link ID"})
    @jwt_required()
    def get(self, link_id):
        """Get Single Link by Id"""
        link = Link.get_by_id(link_id)
        # checks if current user owns the shortened link or is an admin
        if not (current_user.id == link.user_id or current_user.is_admin):
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        message = f"'{link.title}' link retrieved successfully"
        response = {"message": message, "data": link}
        return response, HTTPStatus.OK

    @limiter.limit("10/minute")
    @cache.cached(timeout=50)
    @links_ns.expect(update_link_model)
    @links_ns.marshal_with(link_response_model)
    @links_ns.doc(description="Update Single Link", params={"link_id": "Link ID"})
    @jwt_required()
    def put(self, link_id):
        """Update Single Link by ID"""
        link = Link.get_by_id(link_id)
        # checks if current user owns the shortened link or is an admin
        if not (current_user.id == link.user_id or current_user.is_admin):
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        data = links_ns.payload

        """Validating and updating the URL title"""
        # checks if new title is given and if it matches the current title
        if link.title == data.get("title"):
            # retains the current title
            link.title = link.title
        # validates that the title is not already used by user
        elif link.validate_title_by_user(data.get("title"), current_user.id):
            abort(
                HTTPStatus.CONFLICT,
                message=f"Title '{data.get('title')}' already used by you.",
            )
        else:
            # updates the title
            link.title = data.get("title")

        """Validating and updating the Short URL and is_custom"""
        # checks if custom short URL is given and if it matches the current short URL and if is_custom is True
        if (link.short_url == data.get("short_url")) and (
            link.is_custom == data.get("is_custom")
        ):
            # retains the current short URL and is_custom
            link.short_url, link.is_custom = link.short_url, link.is_custom

        # then checks if is_custom is False and generates a new short URL
        elif data.get("is_custom") == False:
            link.short_url, link.is_custom = link.reset_short_url()

        # then checks if the given custom short URL is already used by user
        elif link.validate_short_url_by_user(data.get("short_url"), current_user.id):
            abort(HTTPStatus.CONFLICT, message="Short URL already used by you.")
        else:
            # updates the short URL and is_custom set to True
            link.short_url, link.is_custom = data.get("short_url"), True

        """Validating and updating the Long URL"""
        # checks if new long URL is already shortened by user

        link_with_long_url = (
            Link.get_link_by_long_url_user_id(data.get("long_url"), current_user.id)
            if link.long_url != data.get(link.long_url)
            else None
        )

        if (link.long_url == data.get("long_url")) or (
            link.long_url.split("//")[1] == data.get("long_url").split("//")[1]
        ):
            # retains the current long URL.
            link.long_url = data.get("long_url")
        elif link_with_long_url:
            message = f"The provided long URL '{link_with_long_url.long_url}' is already shortened by you."
            response = {"message": message, "data": link_with_long_url}
            return response, HTTPStatus.OK
        else:
            # updates the long URL and resets 'visits' to 0
            link.long_url, link.visits = data.get("long_url"), 0
            if link.qr_code_added:
                link.remove_qr_code()
                link.generate_qr_code()

        link.update_db()

        message = f"'{link.title}' link updated successfully"
        response = {"message": message, "data": link}
        return response, HTTPStatus.OK

    @cache.cached(timeout=50)
    @links_ns.doc(description="Delete Single Link", params={"link_id": "Link ID"})
    @jwt_required()
    def delete(self, link_id):
        """Delete Single Link by ID"""
        link = Link.get_by_id(link_id)
        # checks if current user owns the shortened link or is an admin
        if not (current_user.id == link.user_id or current_user.is_admin):
            abort(HTTPStatus.UNAUTHORIZED, message="Unauthorized Request.")

        link.delete_from_db()
        message = f"Link '{link.title}' deleted successfully."
        return message, HTTPStatus.OK


@links_ns.route("/analytics/<int:link_id>")
class ClickAnalytics(Resource):
    @links_ns.marshal_with(link_analytics_response_model)
    @links_ns.doc(
        description="Click Analytics for Single Link", params={"link_id": "Link ID"}
    )
    @jwt_required()
    def get(self, link_id):
        """Get Clicks Analytics for Single Link by Id"""
        click_analytics = (
            db.session.query(ClickAnalytic)
            .outerjoin(Link, Link.id == ClickAnalytic.link_id)
            .filter(ClickAnalytic.link_id == link_id)
            .all()
        )

        message = f"{len(click_analytics)} link clicks retrieved successfully."
        response = {"message": message, "data": click_analytics}
        return response, HTTPStatus.OK
