from . import (
    UnitTestCase,
    get_auth_token_headers,
    create_test_admin,
    create_test_user,
    create_multiple_test_users,
    add_test_link,
    add_multiple_test_links,
)


class AdminTestCase(UnitTestCase):
    def test_AdminGetAllUsers(self):
        test_admin = create_test_admin()
        create_multiple_test_users()

        response = self.client.get(
            "/admin/users/", headers=get_auth_token_headers(test_admin.email)
        )
        assert response.status_code == 200
        users = response.json["data"]
        assert len(users) == 4

    def test_AdminGetUser(self):
        test_admin = create_test_admin()
        test_user = create_test_user()
        user_id = test_user.id

        get_response = self.client.get(
            f"/admin/users/{user_id}", headers=get_auth_token_headers(test_admin.email)
        )
        assert get_response.status_code == 200
        user = get_response.json["data"]
        assert user["email"] == "test_user@test.com"
        assert user["username"] == "test_user"

    def test_AdminUpdateUser(self):
        test_admin = create_test_admin()
        test_user = create_test_user()
        user_id = test_user.id

        update_data = {"email": "user_test@test.com", "username": "user.test"}
        update_response = self.client.put(
            f"/admin/users/{user_id}",
            json=update_data,
            headers=get_auth_token_headers(test_admin.email),
        )
        assert update_response.status_code == 200
        user = update_response.json["data"]
        assert user["email"] == "user_test@test.com"
        assert user["username"] == "user.test"

    def test_AdminDeleteUser(self):
        test_admin = create_test_admin()
        test_user = create_test_user()
        user_id = test_user.id

        del_response = self.client.delete(
            f"/admin/users/{user_id}", headers=get_auth_token_headers(test_admin.email)
        )
        assert del_response.status_code == 200

    def test_AdminGetAllLinks(self):
        test_admin = create_test_admin()
        add_multiple_test_links()

        response = self.client.get("admin/links/", headers=get_auth_token_headers(test_admin.email))
        assert response.status_code == 200
        assert len(response.json["data"]) == 3

    def test_AdminGetUserLinks(self):
        test_user = create_test_user()
        test_admin = create_test_admin()
        add_multiple_test_links()
        user_id = test_user.id

        response = self.client.get(f"admin/links/{user_id}/", headers=get_auth_token_headers(test_admin.email))
        assert response.status_code == 200
        assert len(response.json["data"]) == 2