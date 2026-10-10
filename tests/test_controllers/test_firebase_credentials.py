import json
import pytest
import firebase_admin
from metilda.controllers import pitch_art_wizard

FAKE_KEY = {"type": "service_account", "project_id": "demo", "private_key": "NOT-A-REAL-KEY"}


@pytest.fixture(autouse=True)
def clean_environment(monkeypatch):
    monkeypatch.setattr(firebase_admin, "_apps", {})
    monkeypatch.delenv("FIREBASE_SERVICE_ACCOUNT_JSON", raising=False)
    monkeypatch.delenv("FIREBASE_CREDENTIALS_PATH", raising=False)


@pytest.fixture
def sdk(monkeypatch):
    calls = {"certificate": [], "initialize_app": []}

    def fake_certificate(cert):
        calls["certificate"].append(cert)
        return "credential"

    monkeypatch.setattr(pitch_art_wizard.credentials, "Certificate", fake_certificate)
    monkeypatch.setattr(pitch_art_wizard.firebase_admin, "initialize_app",
                        lambda credential: calls["initialize_app"].append(credential))
    return calls


def test_reads_key_json_from_environment(monkeypatch, sdk):
    monkeypatch.setenv("FIREBASE_SERVICE_ACCOUNT_JSON", json.dumps(FAKE_KEY))
    pitch_art_wizard.init_firebase_admin()
    assert sdk["certificate"] == [FAKE_KEY]
    assert sdk["initialize_app"] == ["credential"]


def test_json_takes_precedence_over_path(monkeypatch, sdk):
    monkeypatch.setenv("FIREBASE_SERVICE_ACCOUNT_JSON", json.dumps(FAKE_KEY))
    monkeypatch.setenv("FIREBASE_CREDENTIALS_PATH", "/somewhere/key.json")
    pitch_art_wizard.init_firebase_admin()
    assert sdk["certificate"] == [FAKE_KEY]


def test_falls_back_to_key_file_path_for_local_development(monkeypatch, sdk):
    monkeypatch.setenv("FIREBASE_CREDENTIALS_PATH", "/somewhere/key.json")
    pitch_art_wizard.init_firebase_admin()
    assert sdk["certificate"] == ["/somewhere/key.json"]
    assert sdk["initialize_app"] == ["credential"]


def test_missing_configuration_fails_loudly_and_reads_no_file(sdk):
    with pytest.raises(RuntimeError, match="not configured"):
        pitch_art_wizard.init_firebase_admin()
    assert sdk["certificate"] == []
    assert sdk["initialize_app"] == []


def test_invalid_json_gives_clear_error_without_echoing_the_value(monkeypatch, sdk):
    monkeypatch.setenv("FIREBASE_SERVICE_ACCOUNT_JSON", "{secret-but-broken")
    with pytest.raises(RuntimeError, match="not valid JSON") as excinfo:
        pitch_art_wizard.init_firebase_admin()
    assert "secret-but-broken" not in str(excinfo.value)
    assert sdk["initialize_app"] == []


def test_does_nothing_when_already_initialised(monkeypatch, sdk):
    monkeypatch.setattr(firebase_admin, "_apps", {"[DEFAULT]": object()})
    monkeypatch.setenv("FIREBASE_SERVICE_ACCOUNT_JSON", json.dumps(FAKE_KEY))
    pitch_art_wizard.init_firebase_admin()
    assert sdk["certificate"] == []
    assert sdk["initialize_app"] == []
