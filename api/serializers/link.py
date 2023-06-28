from ..views import links_ns
from flask_restx import fields


"""INPUT MODEL"""
add_link_model = links_ns.model(
    name="Add Link Model",
    model={
        "title": fields.String(description="Link Title", required=True),
        "long_url": fields.String(description="Long URL", required=True),
        "short_url": fields.String(description="Short/Custom URL"),
        # "is_custom": fields.Boolean(description="Is Custom URL?"),
        "qr_code": fields.Boolean(description="Has QR Code?"),
    },
)

update_link_model = links_ns.model(
    name="Update Link Model",
    model={
        "title": fields.String(description="Link Title", required=True),
        "long_url": fields.String(description="Long URL", required=True),
        "short_url": fields.String(description="Short/Custom URL"),
        "is_custom": fields.Boolean(description="Is Custom URL?"),
    },
)


"""OUTPUT MODEL"""
link_model = links_ns.model(
    name="Add Link Model",
    model={
        "id": fields.Integer(description="Link Id"),
        "title": fields.String(description="Link Title"),
        "long_url": fields.String(description="Long Link"),
        "short_url": fields.String(description="Short/Custom URL"),
        "is_custom": fields.Boolean(description="Is Custom URL?"),
        "qr_code_added": fields.Boolean(description="QR Code Added?"),
        "qr_code_id": fields.String(description="QR Code Id"),
        "visits": fields.Integer(description="Number of Visits"),
        "date_created": fields.Date(description="Date Created"),
        "date_modified": fields.Date(description="Date Modified"),
        "user_id": fields.Integer(description="User ID"),
    },
)

link_response_model = links_ns.model(
    name="Link Response Model",
    model={
        "message": fields.String(description="Response Message"),
        "data": fields.Nested(model=link_model, description="Response Data"),
    },
)

link_analytics_model = links_ns.model(
    name="Link Analytics Model",
    model={
        "id": fields.Integer(description="Click Id"),
        "link_id": fields.Integer(description="Link Id"),
        "title": fields.String(description="Link Title"),
        "long_url": fields.String(description="Long Link"),
        "short_url": fields.String(description="Short/Custom URL"),
        "is_custom": fields.Boolean(description="Is Custom URL?"),
        "qr_code_added": fields.Boolean(description="QR Code Added?"),
        "qr_code_id": fields.String(description="QR Code Id"),
        "visits": fields.Integer(description="Number of Visits"),
        "date_created": fields.Date(description="Date Created"),
        "user_agent": fields.String(description="User Agent"),
        "referrer": fields.String(description="Referrer"),
        "ip_address": fields.String(description="IP Address"),
        "latitude": fields.Float(description="Latitude"),
        "longitude": fields.Float(description="Longitude"),
        "country": fields.String(description="Country"),
        "state": fields.String(description="State"),
        "city": fields.String(description="City"),
        # "timezone": fields.String(description="Time Zone"),
        "device_type": fields.String(description="Device Type"),
        "operating_system": fields.String(description="Operating System"),
        "browser": fields.String(description="Browser"),
        "timestamp": fields.DateTime(description="Timestamp"),
    },
)

link_analytics_response_model = links_ns.model(
    name="Link Analytics Response Model",
    model={
        "message": fields.String(description="Response Message"),
        "data": fields.Nested(model=link_analytics_model, description="Response Data"),
    },
)
