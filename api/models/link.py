import os
from sqlalchemy import and_, func, or_
from ..utils import db, DB_Func
from datetime import datetime
import string
import validators
import qrcode
from random import choices
from decouple import config

qr_code_folder_path = config("QR_CODE_FOLDER_PATH")


class Link(db.Model, DB_Func):
    __tablename__ = "links"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=True)
    long_url = db.Column(db.String(512), nullable=False)
    short_url = db.Column(db.String(20), nullable=False, unique=True)
    is_custom = db.Column(db.Boolean, default=False)
    visits = db.Column(db.Integer, default=0, nullable=False)
    qr_code_added = db.Column(db.Boolean, default=False)
    qr_code_id = db.Column(db.String, nullable=True)
    date_created = db.Column(db.Date, default=datetime.now)
    date_modified = db.Column(db.Date, onupdate=datetime.now)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    clicks = db.relationship("ClickAnalytic", backref="link")

    def __repr__(self):
        return f"<Title: {self.title}>"

    # def __init__(self, **kwargs):
    #     super().__init__(**kwargs)
    #     self.short_url = self.generate_short_url()

    def validate_long_url(self):
        """Validates the long URL to ensure that it is valid URL string."""
        if validators.url(self.long_url):
            return True
        return False

    def generate_short_url(self):
        """Generates s short URL for the given long URL."""
        if self.validate_long_url():
            texts = string.digits + string.ascii_letters
            short_url = "".join(choices(texts, k=5))
            # checks if the short url exist
            link1 = self.query.filter_by(short_url=short_url).first()
            link2 = self.query.filter_by(short_url=self.qr_code_id).first()
            if link1 or link2:
                return self.generate_short_url()
            return short_url

    def reset_short_url(self):
        self.short_url, self.is_custom = (
            (self.qr_code_id, False)
            if self.qr_code_added
            else (self.generate_short_url(), False)
        )

    def generate_qr_code(self):
        """Genereates QR Code for the given long URL."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=20,
            border=3,
        )
        if self.validate_long_url():
            qr.add_data(self.long_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")

            self.qr_code_id = (
                self.short_url if not self.is_custom else self.generate_short_url()
            )
            img.save(f"{qr_code_folder_path}/{self.qr_code_id}.png")

    def remove_qr_code(self):
        img_path = f"{qr_code_folder_path}/{self.qr_code_id}.png"
        # checks if file exist.
        if os.path.exists(img_path):
            # Delete the file
            self.qr_code_id = None
            os.remove(img_path)

    def rename_qr_code(self):
        if self.qr_code_added:
            if (self.qr_code_id != self.short_url) and not self.is_custom:
                old_img_name = f"{self.qr_code_id}.png"
                new_img_name = f"{self.short_url}.png"

                old_img_path = os.path.join(qr_code_folder_path, old_img_name)
                new_img_path = os.path.join(qr_code_folder_path, new_img_name)

                os.rename(old_img_path, new_img_path)
                self.qr_code_id = self.short_url

    def validate_title_by_user(self, title: str, user_id: int):
        """Validates that new title does not already exist for current user."""
        # if self.title == title:
        link = self.query.filter_by(title=title, user_id=user_id).first()
        return True if link else False

    def validate_short_url_by_user(self, short_url: str, user_id: int):
        """Validates that new long URL does not already exist for current user."""
        link = self.query.filter_by(short_url=short_url, user_id=user_id).first()
        return True if link else False

    @classmethod
    def get_by_user_id(cls, user_id: int):
        """Gets all links by user id provided."""
        return cls.query.filter_by(user_id=user_id).order_by(cls.id.desc()).all()

    @classmethod
    def get_link_by_short_url(cls, short_url: str):
        """Gets a link by the shortened URL provided."""
        return cls.query.filter_by(short_url=short_url).first()

    @classmethod
    def get_link_by_long_url_user_id(cls, long_url: str, user_id: int):
        """Gets a link by long URL and user id provided."""
        # to get long URL without http prefix
        long_url_wt_https = (
            long_url
            if long_url.startswith("https://")
            else "https://" + long_url.split("//")[1]
            if long_url.startswith("http://")
            else "https://" + long_url
        )

        long_url_wt_http = (
            long_url
            if long_url.startswith("http://")
            else "http://" + long_url.split("//")[1]
            if long_url.startswith("https://")
            else "http://" + long_url
        )

        return cls.query.filter(
            and_(
                or_(
                    cls.long_url == long_url_wt_https,
                    cls.long_url == long_url_wt_http,
                )
            ),
            cls.user_id == user_id,
        ).first()


class ClickAnalytic(db.Model, DB_Func):
    __tablename__ = "click_analytics"

    id = db.Column(db.Integer, primary_key=True)
    link_id = db.Column(db.Integer, db.ForeignKey("links.id"), nullable=False)
    user_agent = db.Column(db.String)
    referrer = db.Column(db.String)
    timestamp = db.Column(db.DateTime, default=datetime.now)

    # Geolocation info
    ip_address = db.Column(db.String)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    country = db.Column(db.String)
    state = db.Column(db.String)
    city = db.Column(db.String)

    # Device info
    device_type = db.Column(db.String)
    operating_system = db.Column(db.String)
    browser = db.Column(db.String)

    def __init__(
        self,
        link_id,
        user_agent,
        referrer,
        ip_address,
        latitude,
        longitude,
        country,
        state,
        city,
        device_type,
        operating_system,
        browser,
    ):
        self.link_id = link_id
        self.user_agent = user_agent
        self.referrer = referrer
        self.ip_address = ip_address
        self.latitude = latitude
        self.longitude = longitude
        self.country = country
        self.state = state
        self.city = city
        self.device_type = device_type
        self.operating_system = operating_system
        self.browser = browser

    def __repr__(self):
        return f"<Click(link_id={self.link_id}, timestamp={self.timestamp})>"

    def count_clicks_by_link_id(self, link_id):
        """Counts the number of clicks by link_id"""
        return self.query.filter_by(link_id=link_id).count()

    @classmethod
    def get_clicks_counts_by_link_id(cls):
        clicks_counts = db.session.query(
            cls.link_id,
            (func.count(cls.id)).label("clicks_count"),
        ).all()
        return clicks_counts
