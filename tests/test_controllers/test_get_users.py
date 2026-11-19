"""/api/get-users: who may read the list of users, and how much of it.

The frontend reads each row by position: 0 = user id (the email), 1 = university, 2 = created at,
3 = last login, 4 = name. An Admin gets the full rows; any other signed-in user gets only the id
and the name, in the same positions, because Send message needs them for its recipient list.
"""
import pytest
from metilda import app
from metilda.controllers import login_checks, pitch_art_wizard

FULL_ROWS = [
    ['a@example.com', 'University A', 'Mon, 01 Jan 2024 00:00:00 GMT', 'Tue, 02 Jan 2024 00:00:00 GMT', 'User A'],
    ['b@example.com', 'University B', 'Wed, 03 Jan 2024 00:00:00 GMT', 'Thu, 04 Jan 2024 00:00:00 GMT', 'User B'],
]


class ExplodingPostgres(object):
    """Stands in for the database where a refused request must never reach it."""
    def __enter__(self):
        raise AssertionError('the database must not be touched')

    def __exit__(self, *args):
        pass


def fake_users_table(rows):
    """A database whose users table holds `rows`; it answers a query the way Postgres would,
    full rows for SELECT *, and only the id and the name (with NULLs between) otherwise."""
    class FakePostgres(object):
        queries = []

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def execute_select_query(self, query, record=None):
            FakePostgres.queries.append(query)
            if rows is None:
                return None
            if '*' in query:
                return [list(row) for row in rows]
            return [[row[0], None, None, None, row[4]] for row in rows]
    return FakePostgres


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def sign_in_as(monkeypatch, email, admin=False):
    monkeypatch.setattr(login_checks, 'get_caller_email', lambda: email)
    monkeypatch.setattr(login_checks, 'is_admin', lambda who: admin)


def test_no_login_is_refused_with_401_before_touching_the_database(client, monkeypatch):
    monkeypatch.setattr(pitch_art_wizard, 'Postgres', ExplodingPostgres)
    monkeypatch.setattr(login_checks, 'Postgres', ExplodingPostgres)
    response = client.get('/api/get-users')
    assert response.status_code == 401
    assert response.get_json() == {'result': 'Error: login required'}


def test_an_invalid_token_is_refused_with_401_before_touching_the_database(client, monkeypatch):
    def reject(token, request, audience=None, **kwargs):
        raise ValueError('Token expired')
    monkeypatch.setattr(login_checks.id_token, 'verify_firebase_token', reject)
    monkeypatch.setattr(pitch_art_wizard, 'Postgres', ExplodingPostgres)
    monkeypatch.setattr(login_checks, 'Postgres', ExplodingPostgres)
    response = client.get('/api/get-users', headers={'Authorization': 'Bearer not-a-real-token'})
    assert response.status_code == 401
    assert response.get_json() == {'result': 'Error: login required'}


def test_an_admin_gets_the_full_rows(client, monkeypatch):
    sign_in_as(monkeypatch, 'boss@example.com', admin=True)
    monkeypatch.setattr(pitch_art_wizard, 'Postgres', fake_users_table(FULL_ROWS))
    response = client.get('/api/get-users')
    assert response.status_code == 200
    assert response.get_json() == {'result': FULL_ROWS}


def test_a_signed_in_non_admin_gets_only_the_id_and_the_name_in_the_same_positions(client, monkeypatch):
    sign_in_as(monkeypatch, 'user@example.com', admin=False)
    table = fake_users_table(FULL_ROWS)
    monkeypatch.setattr(pitch_art_wizard, 'Postgres', table)
    response = client.get('/api/get-users')
    assert response.status_code == 200
    assert response.get_json() == {'result': [
        ['a@example.com', None, None, None, 'User A'],
        ['b@example.com', None, None, None, 'User B'],
    ]}
    # The other columns are never read from the database for a non-admin.
    assert all('*' not in query for query in table.queries)
    assert all('university' not in query.lower() and 'login' not in query.lower() for query in table.queries)


def test_a_database_error_is_reported_and_not_shown_as_an_empty_success(client, monkeypatch):
    sign_in_as(monkeypatch, 'boss@example.com', admin=True)
    monkeypatch.setattr(pitch_art_wizard, 'Postgres', fake_users_table(None))
    response = client.get('/api/get-users')
    assert response.status_code == 500
    assert response.get_json() == {'result': 'Error: could not read the users'}
