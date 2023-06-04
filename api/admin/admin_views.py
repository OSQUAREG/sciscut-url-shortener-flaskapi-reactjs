from flask import flash, redirect, render_template, url_for, request
from flask_admin.contrib.sqla import ModelView
import flask_login as login
from flask_admin import AdminIndexView, expose
from flask_admin.menu import MenuLink
from .admin_forms import LoginForm, RegistrationForm
from ..models import User
from werkzeug.security import generate_password_hash


# Create customized model view class
class MyModelView(ModelView):
    column_exclude_list = ["password_hash", ]
    page_size = 10
    can_delete = True
    # can_create = False
    edit_modal = True
    can_export = True

    def is_accessible(self):
        return login.current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn"t have access
        return redirect(url_for("admin.login_view", next=request.url))

class LogoutMenuLink(MenuLink):
    def is_accessible(self):
        return login.current_user.is_authenticated

    def get_url(self):
        return url_for("admin.logout_view")


# Create customized index view class that handles login & registration
class MyAdminIndexView(AdminIndexView):

    @expose("/")
    def index(self):
        if not login.current_user.is_authenticated:
            return redirect(url_for(".login_view"))
        return super(MyAdminIndexView, self).index()

    @expose("/login/", methods=("GET", "POST"))
    def login_view(self):
        # handle user login
        form = LoginForm()
        if form.validate_on_submit():
            user = form.get_user()
            if user:
                login.login_user(user)
            else:
                flash("Admin User Not Found")
                return redirect(url_for(".login_view"))

        if login.current_user.is_authenticated:
            return redirect(url_for(".index"))
        link = '<p>Don\'t have an account? <a href="' + url_for('.register_view') + '">Click here to register.</a></p>'
        self._template_args["form"] = form
        self._template_args["link"] = link
        
        return super(MyAdminIndexView, self).index()

    @expose("/register/", methods=("GET", "POST"))
    def register_view(self):
        form = RegistrationForm(request.form)
        if form.validate_on_submit:
            new_admin = User(
                email = form.email.data,
                password_hash = generate_password_hash(form.password.data),
                is_admin = True
            )
            # new_admin.save_to_db()
            print(form.email.data)
            print(form.password.data)

            # login.login_user(new_admin)
            # return redirect(url_for(".index"))
        link = '<p>Already have an account? <a href="' + url_for('.login_view') + '">Click here to log in.</a></p>'
        self._template_args["form"] = form
        self._template_args["link"] = link
        return super(MyAdminIndexView, self).index()

    @expose("/logout/")
    def logout_view(self):
        login.logout_user()
        return redirect(url_for(".index"))

