import pytest
from flask import Flask, jsonify
from metilda import app
from metilda.controllers import login_checks, pitch_art_wizard

ADMIN_ONLY_ROUTES = [
    '/api/add-new-user-from-admin',
    '/api/update-user-from-admin',
    '/api/delete-user',
    '/api/authorize-user',
    '/api/delete-previous-user-roles',
]
SELF_OR_ADMIN_ROUTES = [
    '/api/create-user',
    '/api/create-user-role',
]


class ExplodingPostgres(object):
    """Stands in for the database in tests where a refused request must never reach it."""
    def __enter__(self):
        raise AssertionError('the database must not be touched')

    def __exit__(self, *args):
        pass


def fake_postgres(rows):
    class FakePostgres(object):
        calls = []

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def execute_select_query(self, query, record=None):
            FakePostgres.calls.append(record)
            return rows
    return FakePostgres


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def guarded_app():
    """A tiny app whose routes use the two decorators, so the allowed path can run safely."""
    small = Flask(__name__)

    @small.route('/admin', methods=['POST'])
    @login_checks.admin_required
    def admin_view():
        return jsonify({'result': 'ran'})

    @small.route('/self', methods=['POST'])
    @login_checks.self_or_admin_required('user_id')
    def self_view():
        return jsonify({'result': 'ran'})

    return small.test_client()


def sign_in_as(monkeypatch, email, admin=False):
    monkeypatch.setattr(login_checks, 'get_caller_email', lambda: email)
    monkeypatch.setattr(login_checks, 'is_admin', lambda who: admin)


# --- get_caller_email -------------------------------------------------------------------------

def test_no_authorization_header_means_no_caller():
    with app.test_request_context('/', method='POST'):
        assert login_checks.get_caller_email() is None


def test_a_header_that_is_not_bearer_means_no_caller():
    with app.test_request_context('/', method='POST', headers={'Authorization': 'Basic abc'}):
        assert login_checks.get_caller_email() is None


def test_an_invalid_token_means_no_caller(monkeypatch):
    def reject(token, request, audience=None, **kwargs):
        raise ValueError('Token expired')
    monkeypatch.setattr(login_checks.id_token, 'verify_firebase_token', reject)
    with app.test_request_context('/', method='POST', headers={'Authorization': 'Bearer bad'}):
        assert login_checks.get_caller_email() is None


def test_a_valid_token_gives_the_lower_case_email_and_is_checked_for_our_project(monkeypatch):
    seen = {}

    def accept(token, request, audience=None, **kwargs):
        seen['token'] = token
        seen['audience'] = audience
        return {'email': 'Someone@Example.com'}
    monkeypatch.setattr(login_checks.id_token, 'verify_firebase_token', accept)
    with app.test_request_context('/', method='POST', headers={'Authorization': 'Bearer good-token'}):
        assert login_checks.get_caller_email() == 'someone@example.com'
    assert seen == {'token': 'good-token', 'audience': login_checks.FIREBASE_PROJECT_ID}


def test_a_token_without_an_email_means_no_caller(monkeypatch):
    monkeypatch.setattr(login_checks.id_token, 'verify_firebase_token',
                        lambda token, request, audience=None, **kwargs: {'sub': 'abc'})
    with app.test_request_context('/', method='POST', headers={'Authorization': 'Bearer t'}):
        assert login_checks.get_caller_email() is None


# --- is_admin ---------------------------------------------------------------------------------

def test_is_admin_looks_up_a_verified_admin_role_for_the_lower_case_email(monkeypatch):
    postgres = fake_postgres([(1,)])
    monkeypatch.setattr(login_checks, 'Postgres', postgres)
    assert login_checks.is_admin('Boss@Example.com') is True
    assert postgres.calls == [('boss@example.com', 'Admin')]


@pytest.mark.parametrize('rows', [[], None])
def test_no_rows_or_a_database_error_means_not_admin(monkeypatch, rows):
    monkeypatch.setattr(login_checks, 'Postgres', fake_postgres(rows))
    assert login_checks.is_admin('nobody@example.com') is False


# --- admin_required ---------------------------------------------------------------------------

def test_admin_route_refuses_an_anonymous_caller_with_401(guarded_app):
    response = guarded_app.post('/admin')
    assert response.status_code == 401
    assert response.get_json() == {'result': 'Error: login required'}


def test_admin_route_refuses_a_signed_in_non_admin_with_403(guarded_app, monkeypatch):
    sign_in_as(monkeypatch, 'user@example.com', admin=False)
    response = guarded_app.post('/admin')
    assert response.status_code == 403
    assert response.get_json() == {'result': 'Error: admin role required'}


def test_admin_route_runs_for_an_admin(guarded_app, monkeypatch):
    sign_in_as(monkeypatch, 'boss@example.com', admin=True)
    response = guarded_app.post('/admin')
    assert response.status_code == 200
    assert response.get_json() == {'result': 'ran'}


# --- self_or_admin_required -------------------------------------------------------------------

def test_self_route_refuses_an_anonymous_caller_with_401(guarded_app):
    assert guarded_app.post('/self', data={'user_id': 'a@example.com'}).status_code == 401


def test_a_user_may_act_on_their_own_account_whatever_the_letter_case(guarded_app, monkeypatch):
    sign_in_as(monkeypatch, 'new.user@example.com', admin=False)
    response = guarded_app.post('/self', data={'user_id': ' New.User@Example.com '})
    assert response.status_code == 200


def test_a_user_may_not_act_on_someone_elses_account(guarded_app, monkeypatch):
    sign_in_as(monkeypatch, 'user@example.com', admin=False)
    response = guarded_app.post('/self', data={'user_id': 'victim@example.com'})
    assert response.status_code == 403


def test_a_missing_user_id_is_not_treated_as_the_callers_own_account(guarded_app, monkeypatch):
    sign_in_as(monkeypatch, 'user@example.com', admin=False)
    assert guarded_app.post('/self').status_code == 403


def test_an_admin_may_act_on_anyone(guarded_app, monkeypatch):
    sign_in_as(monkeypatch, 'boss@example.com', admin=True)
    assert guarded_app.post('/self', data={'user_id': 'someone@example.com'}).status_code == 200


# --- the real routes are protected ------------------------------------------------------------

@pytest.mark.parametrize('route', ADMIN_ONLY_ROUTES + SELF_OR_ADMIN_ROUTES)
def test_every_protected_route_refuses_an_anonymous_call_before_touching_anything(client, monkeypatch, route):
    monkeypatch.setattr(login_checks, 'Postgres', ExplodingPostgres)
    monkeypatch.setattr(pitch_art_wizard, 'Postgres', ExplodingPostgres)
    response = client.post(route, data={'user_id': 'victim@example.com', 'email': 'victim@example.com'})
    assert response.status_code == 401


@pytest.mark.parametrize('route', ADMIN_ONLY_ROUTES)
def test_admin_only_routes_refuse_a_signed_in_non_admin_before_touching_anything(client, monkeypatch, route):
    sign_in_as(monkeypatch, 'user@example.com', admin=False)
    monkeypatch.setattr(pitch_art_wizard, 'Postgres', ExplodingPostgres)
    response = client.post(route, data={'user_id': 'victim@example.com', 'email': 'victim@example.com'})
    assert response.status_code == 403


@pytest.mark.parametrize('route', SELF_OR_ADMIN_ROUTES)
def test_sign_up_routes_refuse_a_user_acting_for_someone_else(client, monkeypatch, route):
    sign_in_as(monkeypatch, 'user@example.com', admin=False)
    monkeypatch.setattr(pitch_art_wizard, 'Postgres', ExplodingPostgres)
    response = client.post(route, data={'user_id': 'victim@example.com', 'user_name': 'x',
                                        'university': 'x', 'user_role': 'Admin'})
    assert response.status_code == 403
