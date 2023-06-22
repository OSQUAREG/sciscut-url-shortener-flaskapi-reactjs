from flask_jwt_extended import current_user
from . import UnitTestCase, create_test_user, get_auth_token_headers
from ..models import User


class UserTestCase(UnitTestCase):
    def test_UserPasswordChange(self):
        test_user = create_test_user()
        data = {
            "old_password": "password",
            "new_password": "password123",
            "confirm_password": "password123",
        }
        response = self.client.patch(
            "user/change-password",
            json=data,
            headers=get_auth_token_headers(test_user.email),
        )
        assert response.status_code == 200

    def test_GetCurrentUser(self):
        test_user = create_test_user()

        get_response = self.client.get(
            "/user", headers=get_auth_token_headers(test_user.email)
        )
        assert get_response.status_code == 200
        assert get_response.json["data"]["email"] == "test_user@test.com"

    def test_UpdateCurrentUser(self):
        test_user = create_test_user()
        
        update_data = {"email": "user_test@test.com", "username": "user.test"}
        update_response = self.client.put(
            "/user", json=update_data, headers=get_auth_token_headers(test_user.email)
        )
        assert update_response.status_code == 200
        user = update_response.json["data"]
        assert user["username"] == "user.test"
        assert user["email"] == "user_test@test.com"
