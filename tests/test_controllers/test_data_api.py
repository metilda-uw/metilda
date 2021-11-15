#https://github.com/walkermatt/python-postgres-testing-demo/tree/master/test

from metilda import get_app
from flask import jsonify
import pytest
import testing.postgresql
import psycopg2

import json
import os

email = "test_student@uw.edu"
userid = "test_student@uw.edu"
username = "test_student"
university = "University of Washington"
role = "Student"
research_language = "Blackfoot"
file_name = "NOT_FOUND"
file_path = "NOT_FOUND"
file_type = "NOT_FOUND"
file_size = 1024
file_id = 1
image_name = "NOT_FOUND"
image_path = "NOT_FOUND"
analysis_file_name = "NOT_FOUND"
analysis_file_path = "NOT_FOUND"
analysis_id = "NOT_FOUND"
image_id = 1
eaf_file_id = 1
eaf_file_name = "NOT_FOUND"
eaf_file_path = "NOT_FOUND"

# Reference to testing.postgresql database instance
db = None

# Connection to the database used to set the database state before running each
# test
db_con = None

def setup_module(self):
    """ Module level set-up called once before any tests in this file are
    executed.  Creates a temporary database and sets it up """
    #global db, db_con, db_conf
    self.db = testing.postgresql.Postgresql()
    # Get a map of connection parameters for the database which can be passed
    # to the functions being tested so that they connect to the correct
    # database
    db_conf = db.dsn()
    # Create a connection which can be used by our test functions to set and
    # query the state of the database
    db_con = psycopg2.connect(**db_conf)
    # Commit changes immediately to the database
    db_con.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
    with db_con.cursor() as cur:
        # Create the initial database structure (roles, schemas, tables etc.)
        # basically anything that doesn't change
        cur.execute(slurp('../tests/test_controllers/metilda_schema.sql'))
        # Add the database state
        cur.execute(slurp('../tests/test_controllers/metilda_state.sql'))
    os.environ["DATABASE_URL"] = db.url()

def tearDown(self):
    """ Called after all of the tests in this file have been executed to close
    the database connecton and destroy the temporary database """
    db_con.close()
    db.stop()

def slurp(path):
    """ Reads and returns the entire contents of a file """
    with open(path, 'r') as f:
        return f.read()

@pytest.fixture
def client():
    app = get_app()
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client

def test_data_api_get_users(client):
    rv = client.get(
        '/api/get-users'
    )
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': [['student@uw.edu', 'University of Washington', 'Mon, 28 Dec 2020 01:40:35 GMT', 'Mon, 28 Dec 2020 01:41:12 GMT', 'student'],
                ['teacher@uw.edu', 'University of Washington', 'Mon, 28 Dec 2020 01:40:35 GMT', 'Mon, 28 Dec 2020 01:41:12 GMT', 'teacher'] ]}
    assert result == json.loads(rv.data)

def test_data_api_create_db_user(client):
    rv = client.post("/api/create-user", data= {
            'user_id': email, 'user_name': username, 'university': university
        })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': "test_student@uw.edu"}
    assert result == json.loads(rv.data)

def test_data_api_create_user_research_language(client):
    rv = client.post(
        "/api/create-user-research-language", data = {
        'user_id': email, 'language': research_language
    })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': "test_student@uw.edu"}
    assert result == json.loads(rv.data)

def test_data_api_create_user_research_role(client):
    rv = client.post(
            "/api/create-user-role", data = {
            'user_id': email, 'user_role': role
        })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 'test_student@uw.edu'}
    assert result == json.loads(rv.data)

def test_data_api_update_db_user(client):
    rv = client.post(
        "/api/update-user", data = {
            "user_id": email
        })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': "success"}
    assert result == json.loads(rv.data)
    #TODO: get users and confirm user updated?

def test_data_api_get_user_roles(client):
    rv = client.get("/api/get-user-roles/student@uw.edu")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': [['Student']]}
    assert result == json.loads(rv.data)
    rv = client.get("/api/get-user-roles/teacher@uw.edu")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': [['Teacher']]}
    assert result == json.loads(rv.data)
    rv = client.get("/api/get-user-roles/NOT_FOUND@uw.edu")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': []}
    assert result == json.loads(rv.data)
    #TODO: more roles?

def test_data_api_get_user_research_language(client):
    rv = client.get("/api/get-user-research-language/student@uw.edu")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': [['Blackfoot']]}
    assert result == json.loads(rv.data)
    rv = client.get("/api/get-user-research-language/teacher@uw.edu")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': [['Blackfoot']]}
    assert result == json.loads(rv.data)
    rv = client.get("/api/get-user-research-language/NOT_FOUND@uw.edu")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': []}
    assert result == json.loads(rv.data)

@pytest.mark.skip("Firebase integration")
def test_data_api_delete_user(client):
    rv = client.post(
            "/api/delete-user",
            {
            'user_id': email
        })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': "success"}
    assert result == json.loads(rv.data)

@pytest.mark.skip("Firebase integration")
def test_data_api_add_new_user_from_admin(client):
    assert False

@pytest.mark.skip("Firebase integration")
def test_data_api_update_user_from_admin(client):
    assert False

def test_data_api_authorize_user(client):    
    rv = client.post(
        '/api/authorize-user', data = {
        'email': "teacher@uw.edu", 'user_role': "Teacher"
    })

    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 1}
    assert result == json.loads(rv.data)

def test_data_api_delete_previous_user_roles(client):
    rv = client.post(
        '/api/delete-previous-user-roles', data = {
        'user_id': email, 'user_role': role
        })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 1}
    assert result == json.loads(rv.data)
    
def test_data_api_delete_previous_user_research_language(client):
    rv = client.post(
        '/api/delete-previous-user-research-language', data = {
        'user_id': "student@uw.edu", 'language': research_language
        })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 1}
    assert result == json.loads(rv.data)

def test_data_api_create_file(client):
    rv = client.post(
        "/api/create-file", data ={
        'user_id': email, 'file_name': file_name,'file_path': file_path,'file_type': file_type,
        'file_size': file_size
    })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 1}
    assert result == json.loads(rv.data)

def test_data_api_move_to_folder(client):
    rv = client.post(
        "/api/move-to-folder", data = {
            'file_id': file_id, 'file_path': file_path
    })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 1 }
    assert result == json.loads(rv.data)

def test_data_api_create_folder(client):
    rv = client.post(
        "/api/create-folder", data = {
        'user_id': email, 'file_name': file_name,'file_path':file_path,'file_type':file_type,
        'file_size':file_size
    })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 2 }
    assert result == json.loads(rv.data)

def test_data_api_delete_file(client):
    rv = client.post(
        "/api/delete-folder", data = {
        'file_id': file_id
    })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 1 }
    assert result == json.loads(rv.data)

def test_data_api_delete_eaf_file(client):
    rv = client.post(
        "/api/delete-eaf-file", data = {
        'eaf_id': eaf_file_id
    })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 0 }
    assert result == json.loads(rv.data)

def test_data_api_delete_folder(client):
    rv = client.post(
        "/api/delete-folder", data = {
        'file_id': file_id
    })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 0 }
    assert result == json.loads(rv.data)

def test_data_api_delete_image(client):
    rv = client.post(
        "/api/delete-image", data = {
        'image_id': image_id
    })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 0 }
    assert result == json.loads(rv.data)

def test_data_api_delete_recording(client):
    rv = client.post(
        "/api/delete-recording", data = {
        'user_id': email,'file_path': file_path,'file_type': file_type
    })
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': 1 }
    assert result == json.loads(rv.data)

def test_data_api_get_file(client):
    rv = client.get(
        "/api/get-files/metilda.uw@gmail.edu")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': [] }
    assert result == json.loads(rv.data)

def test_data_api_get_files_and_folders(client):
    rv = client.get(
        "/api/get-files-and-folders/metilda.uw@gmail.edu/Uploads")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': [] }
    assert result == json.loads(rv.data)

def test_data_api_get_eaf_file(client):
    rv = client.get(
        "/api/get-eaf-files/260")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': [[841, 'testeaf_test.eaf']]}
    assert result == json.loads(rv.data)

def test_data_api_get_eaf_file_path(client):
    rv = client.get(
        "/api/get-eaf-file-path/841")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': ['student@uw.edu/Eafs/06-01-2020_08_57_31_testeaf_test.eaf'] }
    assert result == json.loads(rv.data)

def test_data_api_get_eafs_for_files(client):
    rv = client.get(
        "/api/get-eafs-for-files/712")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': [] }
    assert result == json.loads(rv.data)

def test_data_api_get_analysis_file_path(client):
    rv = client.get(
        "/api/get-analysis-file-path/101")
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    result = {'result': ['student@uw.edu/Analyses/02-21-2020_09_12_36_EOP_pannii.json']}
    assert result == json.loads(rv.data)

@pytest.mark.skip
def test_data_api_create_analysis(client):
    assert False

@pytest.mark.skip
def test_data_api_create_eaf(client):
    assert False

@pytest.mark.skip
def test_data_api_update_analysis(client):
    assert False

@pytest.mark.skip
def test_data_api_create_image(client):
    assert False

@pytest.mark.skip
def test_data_api_insert_image_analysis_ids(client):
    assert False

@pytest.mark.skip
def test_data_api_get_analyses_for_file(client):
    assert False

@pytest.mark.skip
def test_data_api_get_image_for_analysis(client):
    assert False

@pytest.mark.skip
def test_data_api_get_all_images(client):
    assert False

@pytest.mark.skip
def test_data_api_get_analyses_for_image(client):
    assert False

@pytest.mark.skip
def test_data_api_get_student_recordings(client):
    assert False

@pytest.mark.skip
def test_data_api_get_admin(client):
    assert False

@pytest.mark.skip
def test_data_api_getOrCreateWords(client):
    assert False


