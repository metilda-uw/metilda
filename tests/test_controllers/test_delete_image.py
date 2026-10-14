"""Tests for the two image delete routes.

/api/delete-image removes only the image: the analysis stays, because saving again over an
existing analysis deletes its old images through this route and must keep the analysis.

/api/delete-image-with-analyses (History > Delete selected) also removes the analyses that no other
image uses, answers with the Storage paths of exactly those analyses, keeps an analysis another
image still uses, and changes nothing (HTTP 500) when anything fails.

These tests use their own temporary database and their own rows, so they do not depend on the
order or the results of the tests in test_data_api.py.
"""

import json
import os

import psycopg2
import pytest
import testing.postgresql

import metilda

HERE = os.path.dirname(os.path.abspath(__file__))
USER = 'student@uw.edu'        # seeded by metilda_state.sql
AUDIO_ID = 260                 # seeded by metilda_state.sql


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


def _analysis(database, analysis_id, path):
    _query(database,
           "INSERT INTO analysis (analysis_id, analysis_file_name, analysis_file_path, audio_id, generated_at, updated_at)"
           " VALUES (%s, %s, %s, %s, now(), now())", (analysis_id, 'a.json', path, AUDIO_ID))


def _image(database, image_id, analysis_ids):
    _query(database,
           "INSERT INTO image (image_id, image_name, image_path, legend_path, created_at, user_id)"
           " VALUES (%s, %s, %s, NULL, now(), %s)", (image_id, 'i.png', 'img/%s.png' % image_id, USER))
    for analysis_id in analysis_ids:
        _query(database, "INSERT INTO image_analysis (analysis_id, image_id) VALUES (%s, %s)", (analysis_id, image_id))


def _exists(database, table, column, value):
    return _query(database, "SELECT count(*) FROM %s WHERE %s = %%s" % (table, column), (value,))[0][0] == 1


def _delete_with_analyses(client, image_id):
    response = client.post('/api/delete-image-with-analyses', data={'image_id': image_id})
    return response, json.loads(response.data)


# /api/delete-image: the image only, never the analysis

def test_delete_image_keeps_the_analysis(client, database):
    _analysis(database, 9101, 'analyses/only.json')
    _image(database, 9101, [9101])

    response = client.post('/api/delete-image', data={'image_id': 9101})

    assert response.status_code == 200
    assert json.loads(response.data) == {'result': 1}
    assert not _exists(database, 'image', 'image_id', 9101)
    assert not _exists(database, 'image_analysis', 'image_id', 9101)
    assert _exists(database, 'analysis', 'analysis_id', 9101)


# /api/delete-image-with-analyses

def test_shared_analysis_is_kept_until_its_last_image_is_deleted(client, database):
    _analysis(database, 9201, 'analyses/shared.json')
    _image(database, 9201, [9201])
    _image(database, 9202, [9201])

    response, body = _delete_with_analyses(client, 9201)

    # The first image goes; the analysis (and so its file) must stay for the second image.
    assert response.status_code == 200
    assert body == {'result': 1, 'deletedAnalysisPaths': []}
    assert not _exists(database, 'image', 'image_id', 9201)
    assert _exists(database, 'image', 'image_id', 9202)
    assert _exists(database, 'analysis', 'analysis_id', 9201)
    assert _exists(database, 'image_analysis', 'image_id', 9202)

    response, body = _delete_with_analyses(client, 9202)

    assert response.status_code == 200
    assert body == {'result': 1, 'deletedAnalysisPaths': ['analyses/shared.json']}
    assert not _exists(database, 'image', 'image_id', 9202)
    assert not _exists(database, 'analysis', 'analysis_id', 9201)


def test_only_the_analyses_nobody_else_uses_are_removed(client, database):
    _analysis(database, 9301, 'analyses/own.json')
    _analysis(database, 9302, 'analyses/shared-with-other.json')
    _image(database, 9301, [9301, 9302])
    _image(database, 9302, [9302])

    response, body = _delete_with_analyses(client, 9301)

    assert response.status_code == 200
    assert body == {'result': 1, 'deletedAnalysisPaths': ['analyses/own.json']}
    assert not _exists(database, 'analysis', 'analysis_id', 9301)
    assert _exists(database, 'analysis', 'analysis_id', 9302)
    assert _exists(database, 'image', 'image_id', 9302)


def test_image_without_analyses_is_just_deleted(client, database):
    _image(database, 9401, [])

    response, body = _delete_with_analyses(client, 9401)

    assert response.status_code == 200
    assert body == {'result': 1, 'deletedAnalysisPaths': []}
    assert not _exists(database, 'image', 'image_id', 9401)


def test_unknown_image_deletes_nothing(client, database):
    response, body = _delete_with_analyses(client, 987654)

    assert response.status_code == 200
    assert body == {'result': 0, 'deletedAnalysisPaths': []}


def test_a_failure_changes_nothing_and_answers_500(client, database):
    # A row that references the image without ON DELETE CASCADE makes "DELETE FROM image" fail.
    _analysis(database, 9501, 'analyses/keep.json')
    _image(database, 9501, [9501])
    _query(database, "CREATE TABLE blocker (image_id integer REFERENCES image(image_id))")
    _query(database, "INSERT INTO blocker (image_id) VALUES (9501)")
    try:
        response, body = _delete_with_analyses(client, 9501)

        assert response.status_code == 500
        assert body == {'result': 'Error: could not delete the image'}
        # The link was deleted before the failing statement, but the whole transaction is rolled back.
        assert _exists(database, 'image', 'image_id', 9501)
        assert _exists(database, 'image_analysis', 'image_id', 9501)
        assert _exists(database, 'analysis', 'analysis_id', 9501)
    finally:
        _query(database, "DROP TABLE blocker")
