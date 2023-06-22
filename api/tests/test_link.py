from flask_jwt_extended import current_user
from . import (
    UnitTestCase,
    add_multiple_test_links,
    create_test_admin,
    create_test_user,
    get_auth_token_headers,
    add_test_link,
)
from ..models import Link


class LinkTestCase(UnitTestCase):
    def test_ShortenLink_Generated(self):
        test_user = create_test_user()

        data = {"title": "Test Link1", "long_url": "http://google.com"}
        response = self.client.post(
            "/links/shorten", json=data, headers=get_auth_token_headers(test_user.email)
        )

        assert response.status_code == 201
        link = response.json["data"]
        assert link["title"] == "Test Link1"
        assert link["long_url"] == "http://google.com"
        assert link["is_custom"] == False

    def test_ShortenLink_Customized(self):
        test_user = create_test_user()

        data2 = {
            "title": "Test Link2",
            "long_url": "http://example.com",
            "short_url": "TesT",
        }
        response2 = self.client.post(
            "/links/shorten", json=data2, headers=get_auth_token_headers(test_user.email)
        )

        assert response2.status_code == 201
        link2 = response2.json["data"]
        assert link2["title"] == "Test Link2"
        assert link2["long_url"] == "http://example.com"
        assert link2["is_custom"] == True
        assert link2["short_url"] == "TesT"

    def test_RedirectLink(self):
        test_user = create_test_user()
        test_link = add_test_link()
        short_url = test_link.short_url

        response = self.client.get(
            f"/links/{short_url}", headers=get_auth_token_headers(test_user.email)
        )
        assert response.status_code == 200
        assert response.json["data"] == "http://example.com"

    def test_ResetLink(self):
        test_user = create_test_user()
        test_link = add_test_link()
        link_id = test_link.id

        response = self.client.patch(
            f"/links/reset/{link_id}", headers=get_auth_token_headers(test_user.email)
        )
        assert response.status_code == 200
        assert response.json["data"]["short_url"] != "TesT"
        assert response.json["data"]["is_custom"] == False

    def test_GenerateQRCode(self):
        test_user = create_test_user()
        test_link = add_test_link()
        link_id = test_link.id

        response = self.client.patch(
            f"/links/qr_code/{link_id}", headers=get_auth_token_headers(test_user.email)
        )
        assert response.status_code == 200
        assert response.json["data"]["qr_code"] == True

    def test_GetCurrentUserLinks(self):
        test_user = create_test_user()
        test_links = add_multiple_test_links()

        response = self.client.get(
            "/links/user", headers=get_auth_token_headers(test_user.email)
        )
        assert response.status_code == 200
        links = response.json["data"]
        assert len(links) == 2

    def test_CurrentUser_GetLinkById(self):
        test_user = create_test_user()
        test_link = add_test_link()
        link_id = test_link.id

        get_response = self.client.get(
            f"links/{link_id}", headers=get_auth_token_headers(test_user.email)
        )
        assert get_response.status_code == 200
        link = get_response.json["data"]
        assert link["title"] == "Test Link"
        assert link["long_url"] == "http://example.com"
        assert link["user_id"] == 1

    def test_CurrentUser_UpdateLinkById(self):
        test_user = create_test_user()
        test_link = add_test_link()
        link_id = test_link.id

        data = {"title": "GLink", "long_url": "http://google.com", "short_url": "GTesT", "is_custom": True}
        update_response = self.client.put(
            f"links/{link_id}",
            json=data,
            headers=get_auth_token_headers(test_user.email),
        )
        assert update_response.status_code == 200
        link_update = update_response.json["data"]
        assert link_update["title"] == "GLink"
        assert link_update["long_url"] == "http://google.com"
        assert link_update["short_url"] == "GTesT"
        assert link_update["is_custom"] == True

    def test_CurrentUser_DeleteLinkById(self):
        test_user = create_test_user()
        test_link = add_test_link()
        link_id = test_link.id
        
        del_response = self.client.delete(
            f"links/{link_id}", headers=get_auth_token_headers(test_user.email)
        )
        assert del_response.status_code == 200

    def test_Admin_GetLinkById(self):
        test_user = create_test_user()
        test_admin = create_test_admin()
        test_link = add_test_link()
        link_id = test_link.id

        get_response = self.client.get(
            f"links/{link_id}", headers=get_auth_token_headers(test_admin.email)
        )
        assert get_response.status_code == 200
        link = get_response.json["data"]
        assert link["title"] == "Test Link"
        assert link["long_url"] == "http://example.com"
        assert link["user_id"] == 1

    def test_Admin_UpdateLinkById(self):
        test_user = create_test_user()
        test_admin = create_test_admin()
        test_link = add_test_link()
        link_id = test_link.id

        data = {"title": "GLink", "long_url": "http://google.com", "short_url": "GTesT", "is_custom": True}
        update_response = self.client.put(
            f"links/{link_id}",
            json=data,
            headers=get_auth_token_headers(test_admin.email),
        )
        assert update_response.status_code == 200
        link_update = update_response.json["data"]
        assert link_update["title"] == "GLink"
        assert link_update["long_url"] == "http://google.com"
        assert link_update["short_url"] == "GTesT"
        assert link_update["is_custom"] == True

    def test_Admin_DeleteLinkById(self):
        test_user = create_test_user()
        test_admin = create_test_admin()
        test_link = add_test_link()
        link_id = test_link.id
        
        del_response = self.client.delete(
            f"links/{link_id}", headers=get_auth_token_headers(test_admin.email)
        )
        assert del_response.status_code == 200
