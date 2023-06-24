import os
from sqlalchemy import and_, or_, text
from ..utils import db, DB_Func
from datetime import datetime
import string
import validators
import qrcode
from random import choices


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

    def __repr__(self):
        return f"<Title: {self.title}>"

    # def __init__(self, **kwargs):
    #     super().__init__(**kwargs)
    #     self.short_url = self.generate_short_url()

    def validate_long_url(self):
        """Validates the long URL to ensure that it is valid URL string."""
        if (
            validators.url(self.long_url)
            or validators.url(f"http://{self.long_url}")
            or validators.url(f"https://{self.long_url}")
        ):
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
        self.short_url, self.is_custom = (self.qr_code_id, False) if self.qr_code_added else (self.generate_short_url(), False)

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
            img.save(f"client/public/qr_code_img/{self.qr_code_id}.png")

    def remove_qr_code(self):
        link = self.get_by_id(self.id)
        img_path = f"client/public/qr_code_img/{self.qr_code_id}.png"
        # checks if file exist.
        if os.path.exists(img_path):
            # Delete the file
            os.remove(img_path)
            self.qr_code_id = None
            return True
        else:
            return False

    def validate_title_by_user(self, title: str, user_id: int):
        """Validates that new title does not already exist for current user."""
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

        long_url_wo_http = (
            long_url.split("//")[1]
            if (long_url.startswith("http://") or long_url.startswith("https://"))
            else long_url
        )

        return (
            cls.query.filter(
                and_(
                    or_(
                        text("long_url = :long_url_wt_https"),
                        text("long_url = :long_url_wt_http"),
                        text("long_url = :long_url_wo_http"),
                    ),
                    cls.user_id == user_id,
                )
            )
            .params(
                long_url_wt_http=long_url_wt_http,
                long_url_wo_http=long_url_wo_http,
                long_url_wt_https=long_url_wt_https,
            )
            .first()
        )
