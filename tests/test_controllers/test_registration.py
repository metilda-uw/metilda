"""Tests for registering signed-in users and for uploads that cannot be registered.

/api/ensure-user gives a signed-in login its missing row in users (an account that signed up on
the other site has a Firebase login but no row here, and then every upload fails). The email comes
only from the verified login. /api/create-user also works when that row already exists, so a
sign-up that races with ensure-user keeps its details and its roles. /api/create-file answers 500
instead of 200 when the file cannot be registered.

These tests use their own temporary database and their own rows.
"""

import json
import os

import psycopg2
import pytest
import testing.postgresql

import metilda
from metilda.controllers import login_checks, pitch_art_wizard

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO_FORM = {'file_name': 'a.wav', 'file_path': 'x/Uploads/a.wav', 'file_type': 'Upload', 'file_size': 10,
              'number_of_syllables': 0, 'recording_word_name': 'null'}


def _slurp(name):
    with open(os.path.join(HERE, name), 'r') as f:
        return f.read()


@pytest.fixture(scope='module')
def database():
    """A throwaway Postgres with the MeTILDA schema; yields an autocommit connection."""
    previous_url = os.environ.get('DATABASE_URL')
    with testing.postgresql.Postgresql() as db:
        connection = psycopg2.connect(**db.dsn())
        connection.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
        with connection.cursor() as cursor:
            cursor.execute(_slurp('metilda_schema.sql'))
            cursor.execute(_slurp('metilda_state.sql'))
            # The schema dump empties search_path for the session; the tests use plain table names.
            cursor.execute('SET search_path TO public')
        os.environ['DATABASE_URL'] = db.url()
        yield connection
        connection.close()
    if previous_url is None:
        os.environ.pop('DATABASE_URL', None)
    else:
        os.environ['DATABASE_URL'] = previous_url


@pytest.fixture
def client(database):
    app = metilda.get_app()
    app.config['TESTING'] = True
    with app.test_client() as test_client:
        yield test_client


def _query(database, sql, args=None):
    with database.cursor() as cursor:
        cursor.execute(sql, args)
        return cursor.fetchall() if cursor.description else None


def _users(database, email):
    return _query(database, "SELECT user_id, user_name, university FROM users WHERE lower(user_id) = lower(%s)", (email,))


def sign_in_as(monkeypatch, email):
    """Pretend the request carries a valid Firebase login for this email."""
    monkeypatch.setattr(login_checks, 'get_caller_email_exact', lambda: email)
    monkeypatch.setattr(login_checks, 'get_caller_email', lambda: email.lower())
    monkeypatch.setattr(login_checks, 'is_admin', lambda who: False)


# /api/ensure-user

def test_ensure_user_needs_a_login(client, database):
    response = client.post('/api/ensure-user')

    assert response.status_code == 401
    assert json.loads(response.data) == {'result': 'Error: login required'}


def test_ensure_user_creates_the_missing_row_once(client, database, monkeypatch):
    sign_in_as(monkeypatch, 'staging.signup@example.com')

    first = client.post('/api/ensure-user')
    second = client.post('/api/ensure-user')

    assert (first.status_code, json.loads(first.data)) == (200, {'result': 'created'})
    assert (second.status_code, json.loads(second.data)) == (200, {'result': 'exists'})
    # One row, a placeholder name from the email, no university, and no role invented.
    assert _users(database, 'staging.signup@example.com') == [('staging.signup@example.com', 'staging.signup', None)]
    assert _query(database, "SELECT count(*) FROM user_role WHERE lower(user_id) = 'staging.signup@example.com'")[0][0] == 0


def test_ensure_user_ignores_any_email_in_the_request(client, database, monkeypatch):
    sign_in_as(monkeypatch, 'real.caller@example.com')

    client.post('/api/ensure-user', data={'user_id': 'someone.else@example.com'})

    assert _users(database, 'someone.else@example.com') == []
    assert len(_users(database, 'real.caller@example.com')) == 1


def test_ensure_user_does_not_duplicate_a_row_with_other_letter_case(client, database, monkeypatch):
    _query(database, "INSERT INTO users (user_id, user_name, university, created_at, last_login)"
                     " VALUES ('Mixed.Case@Example.com', 'mixed', 'UW', now(), now())")
    sign_in_as(monkeypatch, 'mixed.case@example.com')

    response = client.post('/api/ensure-user')

    assert json.loads(response.data) == {'result': 'exists'}
    assert _users(database, 'mixed.case@example.com') == [('Mixed.Case@Example.com', 'mixed', 'UW')]


def test_ensure_user_keeps_long_names_inside_the_column(client, database, monkeypatch):
    email = ('n' * 150) + '@example.com'
    sign_in_as(monkeypatch, email)

    response = client.post('/api/ensure-user')

    assert json.loads(response.data) == {'result': 'created'}
    assert _users(database, email)[0][1] == 'n' * 100


# /api/create-user

def test_create_user_after_ensure_user_keeps_the_signup_details(client, database, monkeypatch):
    sign_in_as(monkeypatch, 'race@example.com')
    client.post('/api/ensure-user')

    response = client.post('/api/create-user', data={
        'user_id': 'race@example.com', 'user_name': 'Race Tester', 'university': 'UW Bothell'})

    # The sign-up still gets its user id back, so its role and language rows attach to it.
    assert (response.status_code, json.loads(response.data)) == (200, {'result': 'race@example.com'})
    assert _users(database, 'race@example.com') == [('race@example.com', 'Race Tester', 'UW Bothell')]


def test_create_user_still_creates_a_new_row(client, database, monkeypatch):
    sign_in_as(monkeypatch, 'fresh@example.com')

    response = client.post('/api/create-user', data={
        'user_id': 'fresh@example.com', 'user_name': 'Fresh', 'university': 'UW'})

    assert (response.status_code, json.loads(response.data)) == (200, {'result': 'fresh@example.com'})
    assert _users(database, 'fresh@example.com') == [('fresh@example.com', 'Fresh', 'UW')]


# /api/create-file

def test_create_file_for_an_unregistered_account_says_so(client, database):
    response = client.post('/api/create-file', data=dict(AUDIO_FORM, user_id='nobody@example.com'))

    assert response.status_code == 500
    assert json.loads(response.data) == {'result': 'Error: the file could not be registered'}
    assert _query(database, "SELECT count(*) FROM audio WHERE user_id = 'nobody@example.com'")[0][0] == 0


def test_create_file_for_a_registered_account_works_as_before(client, database, monkeypatch):
    sign_in_as(monkeypatch, 'uploader@example.com')
    client.post('/api/ensure-user')

    response = client.post('/api/create-file', data=dict(AUDIO_FORM, user_id='uploader@example.com'))

    assert response.status_code == 200
    audio_id = json.loads(response.data)['result']
    assert isinstance(audio_id, int)
    assert _query(database, "SELECT user_id, permission FROM audio_user WHERE audio_id = %s", (audio_id,)) == [
        ('uploader@example.com', 'own')]


def test_create_file_registers_a_recording(client, database, monkeypatch):
    sign_in_as(monkeypatch, 'recorder@example.com')
    client.post('/api/ensure-user')

    response = client.post('/api/create-file', data=dict(
        AUDIO_FORM, user_id='recorder@example.com', file_type='Recording',
        number_of_syllables=3, recording_word_name='saahkomaapiwa'))

    assert response.status_code == 200
    audio_id = json.loads(response.data)['result']
    assert _query(database, "SELECT number_of_syllables, recording_name FROM recording_info WHERE audio_id = %s",
                  (audio_id,)) == [(3, 'saahkomaapiwa')]


def test_registering_at_sign_in_lets_the_upload_work(client, database, monkeypatch):
    """The whole story: a login without a row cannot upload; after ensure-user it can."""
    email = 'signed.up.elsewhere@example.com'
    refused = client.post('/api/create-file', data=dict(AUDIO_FORM, user_id=email))
    sign_in_as(monkeypatch, email)
    client.post('/api/ensure-user')
    accepted = client.post('/api/create-file', data=dict(AUDIO_FORM, user_id=email))

    assert refused.status_code == 500
    assert accepted.status_code == 200
