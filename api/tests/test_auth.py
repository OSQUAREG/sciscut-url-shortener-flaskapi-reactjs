from . import UnitTestCase, create_test_user


class AuthTestCase(UnitTestCase):
    def test_UserSignup(self):
        data = {"email": "test_user@test.com", "password": "password"}
        response = self.client.post("/auth/signup", json=data)
        assert response.status_code == 201
        test_user = response.json["data"]
        assert test_user["email"] == "test_user@test.com"

    def test_UserLogin(self):
        test_user = create_test_user()
        data = {"email": "test_user@test.com", "password": "password"}
        response = self.client.post("/auth/login", json=data)
        assert response.status_code == 201
