
import pytest
from metilda import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_manifest_is_served_as_json(client):
    response = client.get("/manifest.json")

    assert response.status_code == 200
    assert response.mimetype == "application/json"
    assert response.json["name"] == "metilda"


def test_favicon_is_served_as_icon(client):
    response = client.get("/favicon.ico")

    assert response.status_code == 200
    assert response.mimetype in ("image/x-icon", "image/vnd.microsoft.icon")
    assert response.data.startswith(b"\x00\x00\x01\x00")


def test_homepage_still_returns_html(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.mimetype == "text/html"


def test_react_route_still_returns_html(client):
    response = client.get("/learn")

    assert response.status_code == 200
    assert response.mimetype == "text/html"

def test_missing_static_file_returns_404(client):
    response = client.get("/missing-file.js")

    assert response.status_code == 404

def test_react_route_with_period_returns_html(client):
    response = client.get("/profile/jane.doe")

    assert response.status_code == 200
    assert response.mimetype == "text/html"


def test_path_traversal_does_not_expose_repository_files(client):
    response = client.get("/../package.json")

    assert response.status_code == 404
