from __future__ import with_statement
import os
import shutil
import tempfile
import flask
import uuid
from flask import request, jsonify, send_file, flash
from Postgres import Postgres
from metilda import app
from metilda.default import MIN_PITCH_HZ, MAX_PITCH_HZ
from metilda.services import audio_analysis, file_io, praat, utils
from werkzeug.utils import secure_filename
import firebase_admin
from firebase_admin import credentials, db, auth
import wave
import pympi
import pathlib
import matplotlib
matplotlib.use('agg')
from pylab import *
import xml.etree.ElementTree as ET
import lxml.etree as etree


ALLOWED_EXTENSIONS = {'wav', 'mp3', 'mpeg'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/audio/<string:upload_id>.png/image', methods=["GET"])
def audio_analysis_image(upload_id):
    image_path = os.path.join(app.config["SOUNDS"], upload_id)
    tmin = request.args.get('tmin', -1, type=float)
    tmax = request.args.get('tmax', -1, type=float)
    min_pitch = request.args.get('min-pitch', MIN_PITCH_HZ, type=float)
    max_pitch = request.args.get('max-pitch', MAX_PITCH_HZ, type=float)

    image_binary = audio_analysis.audio_analysis_image(
        image_path,
        min_pitch=min_pitch,
        max_pitch=max_pitch,
        tmin=tmin,
        tmax=tmax)

    return send_file(image_binary, mimetype="image/png")


@app.route('/api/audio/<string:upload_id>/file', methods=["GET"])
def audio(upload_id):
    if upload_id == "undefined":
        # This is the case when the page load and a file has
        # not been selected
        return "", 204

    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    tmin = request.args.get('tmin', -1, type=float)
    tmax = request.args.get('tmax', -1, type=float)
    file_bytes = audio_analysis.get_audio(sound_path, tmin=tmin, tmax=tmax)
    return send_file(file_bytes, mimetype="audio/wav")


@app.route('/api/audio/<string:upload_id>/pitch/avg', methods=["GET"])
def avg_pitch(upload_id):
    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    t0 = request.args.get('t0', type=float)
    t1 = request.args.get('t1', type=float)
    max_pitch = request.args.get('max-pitch', MAX_PITCH_HZ, type=float)
    min_pitch = request.args.get('min-pitch', MIN_PITCH_HZ, type=float)
    result = audio_analysis.get_avg_pitch((t0, t1), sound_path, min_pitch, max_pitch)
    return jsonify({"avg_pitch": result})


@app.route('/api/audio/<string:upload_id>/pitch/range', methods=["GET"])
def all_audio_pitches(upload_id):
    max_pitch = request.args.get('max-pitch', MAX_PITCH_HZ, type=float)
    min_pitch = request.args.get('min-pitch', MIN_PITCH_HZ, type=float)
    t0 = request.args.get('t0', 0, type=float)
    t1 = request.args.get('t1', float('inf'), type=float)

    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    pitches = audio_analysis.get_all_pitches([t0, t1], sound_path, min_pitch, max_pitch)

    return jsonify({'pitches': pitches})


@app.route('/api/upload/pitch/range', methods=["POST"])
def all_upload_pitches():
    max_pitch = request.args.get('max-pitch', MAX_PITCH_HZ, type=float)
    min_pitch = request.args.get('min-pitch', MIN_PITCH_HZ, type=float)
    t0 = request.args.get('t0', 0, type=float)
    t1 = request.args.get('t1', float('inf'), type=float)

    temp_dir = tempfile.mkdtemp()
    audio_file = request.files['file']
    sound_path = os.path.join(temp_dir, "audio.wav")
    audio_file.save(sound_path)

    pitches = audio_analysis.get_all_pitches([t0, t1], sound_path, min_pitch, max_pitch)
    shutil.rmtree(temp_dir)

    return jsonify({'pitches': pitches})


@app.route('/api/audio/<string:upload_id>/duration', methods=["GET"])
def sound_length(upload_id):
    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    sound_length = audio_analysis.get_sound_length(sound_path)
    return jsonify({'duration': sound_length})

@app.route('/api/audio/download-file', methods=["POST"])
def download_file(): 
    file=request.files['file']
    if file.filename == '':
            flash('No selected file')
    if file and allowed_file(file.filename):
            # filename = secure_filename(file.filename)
            filename = file.filename
            sound_path = os.path.join(app.config["SOUNDS"], filename)
            file.save(sound_path)
    return jsonify({'result': 'success'})


@app.route('/api/audio', methods=["GET"])
def available_files():
    return jsonify({'ids': file_io.available_files(app.config["SOUNDS"])})


@app.route('/api/create-user', methods=["POST"])
def create_db_user():
    with Postgres() as connection:
        postgres_insert_query = """ INSERT INTO users (USER_ID, USER_NAME, UNIVERSITY,
        CREATED_AT, LAST_LOGIN) VALUES (%s,%s,%s,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING USER_ID"""
        record_to_insert = (request.form['user_id'], request.form['user_name'], request.form['university'])
        last_row_id = connection.execute_insert_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/create-user-research-language', methods=["POST"])
def create_user_research_language():
    with Postgres() as connection:
        postgres_insert_query = """ INSERT INTO user_research_language (USER_ID, USER_LANGUAGE) VALUES (%s,%s) RETURNING USER_ID"""
        record_to_insert = (request.form['user_id'], request.form['language'])
        last_row_id = connection.execute_insert_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/create-user-role', methods=["POST"])
def create_user_research_role():
    with Postgres() as connection:
        postgres_insert_query = """ INSERT INTO user_role (USER_ID, USER_ROLE) VALUES (%s,%s) RETURNING USER_ID"""
        record_to_insert = (request.form['user_id'], request.form['user_role'])
        last_row_id = connection.execute_insert_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/update-user', methods=["POST"])
def update_db_user():
    with Postgres() as connection:
        postgres_insert_query = """ UPDATE users
                SET last_login = CURRENT_TIMESTAMP
                WHERE user_id = %s"""
        connection.execute_update_query(postgres_insert_query, (request.form['user_id'],))
    return jsonify({'result': 'success'})

@app.route('/api/create-file', methods=["POST"])
def create_file():
    with Postgres() as connection:
        postgres_insert_query = """ INSERT INTO audio (AUDIO_ID, USER_ID, FILE_NAME, FILE_PATH, FILE_TYPE, FILE_SIZE,
         CREATED_AT, UPDATED_AT) VALUES (DEFAULT,%s,%s,%s,%s,%s,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING AUDIO_ID"""
        record_to_insert = (request.form['user_id'], request.form['file_name'], request.form['file_path'],request.form['file_type'],
        request.form['file_size'])
        last_row_id = connection.execute_insert_query(postgres_insert_query, record_to_insert)
        if request.form['file_type'] == 'Recording':
            postgres_insert_query = """ INSERT INTO recording_info (AUDIO_ID, NUMBER_OF_SYLLABLES, RECORDING_NAME) VALUES (%s,%s,%s) RETURNING AUDIO_ID"""
            record_to_insert = (last_row_id, request.form['number_of_syllables'], request.form['recording_word_name'])
            connection.execute_insert_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/move-to-folder', methods=["POST"])
def move_to_folder():
    with Postgres() as connection:
        postgres_update_query = """ UPDATE audio 
            SET FILE_PATH = %s
            WHERE AUDIO_ID = %s"""
        record_to_update = (request.form['file_path'], request.form['file_id'])
        last_row_id = connection.execute_update_query(postgres_update_query, record_to_update)
    return jsonify({'result': last_row_id})

@app.route('/api/create-folder', methods=["POST"])
def create_folder():
    with Postgres() as connection:
        postgres_insert_query = """ INSERT INTO audio (AUDIO_ID, USER_ID, FILE_NAME, FILE_PATH, FILE_TYPE, FILE_SIZE,
         CREATED_AT, UPDATED_AT) VALUES (DEFAULT,%s,%s,%s,%s,%s,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING AUDIO_ID"""
        record_to_insert = (request.form['user_id'], request.form['file_name'], request.form['file_path'],request.form['file_type'],
        request.form['file_size'])
        last_row_id = connection.execute_insert_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/delete-file', methods=["POST"])
def delete_file():
    with Postgres() as connection:
        postgres_select_query = """ DELETE FROM audio WHERE AUDIO_ID = %s"""
        results = connection.execute_update_query(postgres_select_query, (request.form['file_id'],))
    return jsonify({'result': results})

@app.route('/api/delete-eaf-file', methods=["POST"])
def delete_eaf_file():
    with Postgres() as connection:
        postgres_select_query = """ DELETE FROM eaf WHERE EAF_ID = %s"""
        results = connection.execute_update_query(postgres_select_query, (request.form['eaf_id'],))
    return jsonify({'result': results})

@app.route('/api/delete-folder', methods=["POST"])
def delete_folder():
    with Postgres() as connection:
        postgres_delete_query = """ DELETE FROM audio WHERE AUDIO_ID = %s"""
        results = connection.execute_update_query(postgres_delete_query, (request.form['file_id'],))
    return jsonify({'result': results})

@app.route('/api/delete-image', methods=["POST"])
def delete_image():
    with Postgres() as connection:
        postgres_select_query = """ DELETE FROM image WHERE IMAGE_ID = %s"""
        results = connection.execute_update_query(postgres_select_query, (request.form['image_id'],))
    return jsonify({'result': results})

@app.route('/api/delete-recording', methods=["POST"])
def delete_recording():
    with Postgres() as connection:
        postgres_select_query = """ DELETE FROM audio WHERE USER_ID = %s AND FILE_PATH LIKE %s AND FILE_TYPE= %s"""
        record_to_delete = (request.form['user_id'], "%"+request.form['file_path']+"%", request.form['file_type'])
        results = connection.execute_update_query(postgres_select_query, record_to_delete)
    return jsonify({'result': results})

@app.route('/api/get-files/<string:user_id>', methods=["GET"])
def get_file(user_id):
    file_type = request.args.get('file-type', type=None)
    with Postgres() as connection:
        postgres_select_query = """ SELECT * FROM audio WHERE USER_ID = %s AND FILE_TYPE = %s"""
        filter_values= (user_id, file_type)
        results = connection.execute_select_query(postgres_select_query, filter_values)
    return jsonify({'result': results})

@app.route('/api/get-files-and-folders/<string:user_id>/<string:folder_name>', methods=["GET"])
def get_files_and_folders(user_id, folder_name):
    file_type1 = request.args.get('file-type1', type=None)
    file_type2 = request.args.get('file-type2', type=None)
    file_path = ""
    filteredResults = []
    with Postgres() as connection:
        postgres_select_query = """ SELECT * FROM audio WHERE USER_ID = %s AND (FILE_TYPE = %s OR FILE_TYPE = %s) AND FILE_PATH LIKE %s"""
        if folder_name != 'Uploads':
            file_path = user_id + "/Uploads/" + folder_name + "/%"
        else: 
            file_path = user_id + "/Uploads/%"
        filter_values= (user_id, file_type1, file_type2, file_path)
        results = connection.execute_select_query(postgres_select_query, filter_values)
        if folder_name == 'Uploads':
            for result in results:
                forwardSlashCounter = result[2].count('/')
                if forwardSlashCounter == 2:
                    filteredResults.append(result)
            return jsonify({'result': filteredResults})
        else:
            return jsonify({'result': results})

@app.route('/api/get-eaf-files/<string:audio_id>', methods=["GET"])
def get_eaf_file(audio_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT EAF_ID, EAF_FILE_NAME FROM eaf WHERE AUDIO_ID = %s"""
        results = connection.execute_select_query(postgres_select_query, (audio_id,))
    return jsonify({'result': results})

@app.route('/api/get-eaf-file-path/<string:eaf_id>', methods=["GET"])
def get_eaf_file_path(eaf_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT EAF_FILE_PATH FROM eaf WHERE EAF_ID = %s"""
        results = connection.execute_select_query(postgres_select_query, (eaf_id,))
    return jsonify({'result': results[0]})

@app.route('/api/get-eafs-for-files/<string:audio_id>', methods=["GET"])
def get_eafs_for_files(audio_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT * FROM eaf WHERE AUDIO_ID = %s"""
        results = connection.execute_select_query(postgres_select_query, (audio_id,))
    return jsonify({'result': results})

@app.route('/api/get-analysis-file-path/<string:analysis_id>', methods=["GET"])
def get_analysis_file_path(analysis_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT ANALYSIS_FILE_PATH FROM analysis WHERE ANALYSIS_ID = %s"""
        results = connection.execute_select_query(postgres_select_query, (analysis_id,))
    return jsonify({'result': results[0]})

@app.route('/api/create-analysis', methods=["POST"])
def create_analysis():
    with Postgres() as connection:
        postgres_insert_query = """ INSERT INTO analysis (ANALYSIS_ID, AUDIO_ID, ANALYSIS_FILE_NAME, ANALYSIS_FILE_PATH, GENERATED_AT, UPDATED_AT) VALUES (DEFAULT,%s,%s,%s,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING ANALYSIS_ID"""
        record_to_insert = (request.form['file_id'], request.form['analysis_file_name'],request.form['analysis_file_path'])
        last_row_id=connection.execute_insert_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/create-eaf', methods=["POST"])
def create_eaf():
    with Postgres() as connection:
        postgres_insert_query = """ INSERT INTO eaf (EAF_ID, AUDIO_ID, EAF_FILE_NAME, EAF_FILE_PATH, GENERATED_AT, UPDATED_AT) VALUES (DEFAULT,%s,%s,%s,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING EAF_ID"""
        record_to_insert = (request.form['file_id'], request.form['eaf_file_name'],request.form['eaf_file_path'])
        last_row_id=connection.execute_insert_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/update-analysis', methods=["POST"])
def update_analysis():
    with Postgres() as connection:
        postgres_insert_query = """ UPDATE analysis SET ANALYSIS_FILE_PATH=%s, UPDATED_AT=CURRENT_TIMESTAMP WHERE ANALYSIS_ID=%s"""
        record_to_insert = (request.form['analysis_file_path'], request.form['analysis_id'])
        last_row_id=connection.execute_update_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/create-image', methods=["POST"])
def create_image():
    with Postgres() as connection:
        postgres_insert_query = """ INSERT INTO image (IMAGE_ID, IMAGE_NAME, IMAGE_PATH, USER_ID, CREATED_AT) VALUES (DEFAULT,%s,%s,%s, CURRENT_TIMESTAMP) RETURNING IMAGE_ID"""
        record_to_insert = (request.form['image_name'], request.form['image_path'], request.form['user_id'])
        last_row_id=connection.execute_insert_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/create-image-analysis', methods=["POST"])
def insert_image_analysis_ids():
    with Postgres() as connection:
        postgres_insert_query = """ INSERT INTO image_analysis (IMAGE_ID, ANALYSIS_ID) VALUES (%s,%s) RETURNING ANALYSIS_ID"""
        record_to_insert = (request.form['image_id'], request.form['analysis_id'])
        last_row_id=connection.execute_insert_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})

@app.route('/api/get-analyses-for-file/<string:file_id>', methods=["GET"])
def get_analyses_for_file(file_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT * FROM analysis WHERE AUDIO_ID = %s"""
        filter_values= (file_id)
        results = connection.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

@app.route('/api/get-image-for-analysis/<string:analysis_id>', methods=["GET"])
def get_image_for_analysis(analysis_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT IMAGE.* FROM IMAGE, IMAGE_ANALYSIS WHERE IMAGE_ANALYSIS.ANALYSIS_ID = %s AND IMAGE.IMAGE_ID=IMAGE_ANALYSIS.IMAGE_ID"""
        filter_values= (analysis_id)
        results = connection.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

@app.route('/api/get-all-images-for-user/<string:user_id>', methods=["GET"])
def get_all_images(user_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT * FROM IMAGE WHERE IMAGE_PATH LIKE %s"""
        filter_values=("%"+user_id+"%")
        results = connection.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

@app.route('/api/get-analyses-for-image/<string:image_id>', methods=["GET"])
def get_analyses_for_image(image_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT ANALYSIS.* FROM ANALYSIS, IMAGE_ANALYSIS WHERE IMAGE_ANALYSIS.IMAGE_ID = %s AND ANALYSIS.ANALYSIS_ID=IMAGE_ANALYSIS.ANALYSIS_ID"""
        filter_values= (image_id)
        results = connection.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

@app.route('/api/get-all-students', methods=["GET"])
def get_student_recordings():
    with Postgres() as connection:
        postgres_select_query = """ SELECT USERS.USER_NAME, USERS.USER_ID,USERS.LAST_LOGIN FROM USERS, USER_ROLE WHERE USER_ROLE= %s AND USERS.USER_ID=USER_ROLE.USER_ID"""
        filter_values= ('Student')
        results = connection.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

@app.route('/api/get-user-with-verified-role/<string:user_id>', methods=["GET"])
def get_admin(user_id):
    user_role = request.args.get('user-role', type=None)
    with Postgres() as connection:
        postgres_select_query = """ SELECT * FROM USER_ROLE WHERE USER_ROLE= %s AND USER_ID=%s AND VERIFIED = true"""
        filter_values= (user_role,user_id)
        results = connection.execute_select_query(postgres_select_query, filter_values)
    return jsonify({'result': results})

@app.route('/api/get-users', methods=["GET"])
def get_users():
    with Postgres() as connection:
        postgres_select_query = """ SELECT * FROM USERS """
        filter_values=()
        results = connection.execute_select_query(postgres_select_query,(filter_values,))
    return jsonify({'result': results})

@app.route('/api/get-user-roles/<string:user_id>', methods=["GET"])
def get_user_roles(user_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT USER_ROLE FROM USER_ROLE WHERE USER_ID = %s """
        filter_values=(user_id)
        results = connection.execute_select_query(postgres_select_query,(filter_values,))
    return jsonify({'result': results})


@app.route('/api/get-user-research-language/<string:user_id>', methods=["GET"])
def get_user_research_language(user_id):
    with Postgres() as connection:
        postgres_select_query = """ SELECT USER_LANGUAGE FROM USER_RESEARCH_LANGUAGE WHERE USER_ID = %s """
        filter_values=(user_id)
        results = connection.execute_select_query(postgres_select_query,(filter_values,))
    return jsonify({'result': results})

@app.route('/api/delete-user', methods=["POST"])
def delete_user():
    user_id=request.form['user_id']
    # Delete user from firebase
    if (not len(firebase_admin._apps)):
        certificate_path = os.path.join(app.config["CERTIFICATES"], "serviceAccountKey.json")
        service_account_credential = credentials.Certificate(certificate_path)
        firebase_admin.initialize_app(service_account_credential)
    user = auth.get_user_by_email(user_id)
    auth.delete_user(user.uid)
    print('Successfully deleted user from firebase')
    # Delete user from DB
    with Postgres() as connection:
        postgres_select_query = """ DELETE FROM USERS WHERE USER_ID = %s """
        filter_values=(user_id)
        results = connection.execute_update_query(postgres_select_query,(filter_values,))
    return jsonify({'result': results})

@app.route('/api/add-new-user-from-admin', methods=["POST"])
def add_new_user_from_admin():
    if (not len(firebase_admin._apps)):
        certificate_path = os.path.join(app.config["CERTIFICATES"], "serviceAccountKey.json")
        service_account_credential = credentials.Certificate(certificate_path)
        firebase_admin.initialize_app(service_account_credential)
    try:
        # Insert user into firebase
        user = auth.create_user(
        email=request.form['email'],
        password=request.form['password'])
        print('Sucessfully created new user: {0}'.format(user.uid))
        # Insert user into DB
        with Postgres() as connection:
            postgres_insert_query = """ INSERT INTO users (USER_ID, USER_NAME, UNIVERSITY,
            CREATED_AT, LAST_LOGIN) VALUES (%s,%s,%s,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING USER_ID"""
            record_to_insert = (request.form['email'], request.form['user_name'], request.form['university'])
            last_row_id = connection.execute_insert_query(postgres_insert_query, record_to_insert)
        return jsonify({'result': str(last_row_id)})
    except Exception as e:
        print(str(e))
        return jsonify({'result': 'Error: '+str(e)})

@app.route('/api/update-user-from-admin', methods=["POST"])
def update_user_from_admin():
    if (not len(firebase_admin._apps)):
        certificate_path = os.path.join(app.config["CERTIFICATES"], "serviceAccountKey.json")
        service_account_credential = credentials.Certificate(certificate_path)
        firebase_admin.initialize_app(service_account_credential)
    try:
        # Update user in firebase
        previous_email=request.form['previous_email']
        email=request.form['email']
        username=request.form['user_name']
        university=request.form['university']
        password=request.form['password']
        uid = auth.get_user_by_email(previous_email).uid
        user = auth.update_user(
        uid,
        email=email,
        password=password)
        print('Sucessfully updated new user: {0}'.format(user.uid))
        # Update user in DB
        with Postgres() as connection:
            postgres_insert_query = """ UPDATE users SET USER_ID=%s,USER_NAME=%s, UNIVERSITY=%s WHERE USER_ID = %s"""
            record_to_insert = (email, username, university, previous_email)
            last_row_id = connection.execute_update_query(postgres_insert_query, record_to_insert)
        return jsonify({'result': str(last_row_id)})
    except Exception as e:
        print(str(e))
        return jsonify({'result': 'Error: '+str(e)})

@app.route('/api/delete-previous-user-roles', methods=["POST"])
def delete_previous_user_roles():
    with Postgres() as connection:
        postgres_select_query = """ DELETE FROM user_role WHERE USER_ID = %s AND USER_ROLE=%s"""
        record_to_delete = (request.form['user_id'], request.form['user_role'])
        results = connection.execute_update_query(postgres_select_query, record_to_delete)
    return jsonify({'result': results})

@app.route('/api/delete-previous-user-research-language', methods=["POST"])
def delete_previous_user_research_language():
    with Postgres() as connection:
        postgres_select_query = """ DELETE FROM user_research_language WHERE USER_ID = %s AND USER_LANGUAGE=%s"""
        record_to_delete = (request.form['user_id'], request.form['language'])
        results = connection.execute_update_query(postgres_select_query, record_to_delete)
    return jsonify({'result': results})

@app.route('/api/authorize-user', methods=["POST"])
def authorize_user():
    with Postgres() as connection:
        postgres_insert_query = """ UPDATE user_role SET VERIFIED = true WHERE USER_ID=%s AND USER_ROLE=%s"""
        record_to_insert = (request.form['email'], request.form['user_role'])
        last_row_id=connection.execute_update_query(postgres_insert_query, record_to_insert)
    return jsonify({'result': last_row_id})


@app.route('/api/words/<string:upload_id>', methods=["PATCH", "DELETE"])
def modifyPitchOrImageDetails(upload_id):
    req_method = flask.request.method

    if req_method == "PATCH":
        with Postgres() as connection:
            postgres_select_query = """ SELECT id FROM word WHERE id = %s"""
            select_results = connection.execute_select_query(postgres_select_query, (upload_id,))

            if not select_results:
                return jsonify({'isSuccessful': False, 'description': "Word does not exist"}), 404
            else:

                body = request.json
                no_valid_fields_provided = ("minPitch" not in body) and ("maxPitch" not in body) and (
                            "imagePath" not in body)

                if not body or no_valid_fields_provided:
                    return jsonify({'isSuccessful': False, 'description': "Valid body not provided"}), 400

                postgres_update_query = """ UPDATE word"""

                valid_fields = {"minPitch": "min_pitch", "maxPitch": "max_pitch", "imagePath": "image_path"}
                record_to_update = []

                set_appended = False
                for field in valid_fields:
                    if field in body:
                        if not set_appended:
                            postgres_update_query += """ SET """ + valid_fields[field] + """ = %s"""
                            set_appended = True
                        else:
                            postgres_update_query += ", " + valid_fields[field] + """ = %s"""

                        record_to_update.append(str(body[field]))

                postgres_update_query += """ WHERE id = %s """
                record_to_update.append(upload_id)

                record_to_update = tuple(record_to_update)

                connection.execute_update_query(postgres_update_query, record_to_update)

                response = {'isSuccessful': True, 'word': upload_id}
                for field in valid_fields:
                    if field in body:
                        response[field] = body[field]

                return jsonify(response)

    elif req_method == "DELETE":
        with Postgres() as connection:
            postgres_select_query = """ SELECT id FROM word WHERE id = %s"""
            select_results = connection.execute_select_query(postgres_select_query, (upload_id,))

            if not select_results:
                return jsonify({'isSuccessful': False, 'description': "Word does not exist for purposes of deletion"}), 404
            else:
                postgres_delete_query = """ DELETE FROM word WHERE id = %s"""
                word_to_delete = (str(upload_id))

                connection.execute_update_query(postgres_delete_query, (upload_id,))

                return jsonify({'isSuccessful': True, 'wordDeleted': upload_id})





@app.route('/api/words', methods=["GET", "POST"])
def getOrCreateWords():
    req_method = flask.request.method

    if req_method == "GET":
        upload_id = request.args.get('uploadId')
        num_syllables = request.args.get('numSyllables')
        accent_index = request.args.get('accentIndex')


        syllable_filter = " WHERE num_syllables = %s"
        index_filter = " AND accent_index = %s"

        with Postgres() as connection:

            word_retrieval_query = """ SELECT * FROM word"""

            query_results = None
            if upload_id:
                word_retrieval_query += " WHERE id = %s"
                query_results = connection.execute_select_query(word_retrieval_query, (str(upload_id),))
            elif num_syllables and accent_index:
                word_retrieval_query += syllable_filter + index_filter
                query_results = connection.execute_select_query(word_retrieval_query, (str(num_syllables), (str(accent_index))))
            elif num_syllables:
                word_retrieval_query += syllable_filter + " ORDER BY accent_index"
                query_results = connection.execute_select_query(word_retrieval_query, (str(num_syllables),))
            else:
                query_results = connection.execute_select_query(word_retrieval_query)

            response = {"isSuccessful": True, "data": []}

            for res in query_results:
                letters_retrieval_query = """ SELECT * FROM letter WHERE word_id = %s ORDER BY order_index"""
                letters = []
                letters_query_results = connection.execute_select_query(letters_retrieval_query, (str(res[0]),))

                for row in letters_query_results:
                    letters.append(
                        {
                            "syllable": row[1],
                            "t0": row[3],
                            "t1": row[4],
                            "pitch": row[5],
                            "isManualPitch": row[6],
                            "isWordSep": row[7]
                        }
                    )

                response["data"].append(
                    {
                        "uploadId": res[0],
                        "creator": res[1],
                        "numSyllables": res[2],
                        "accentIndex": res[3],
                        "minPitch": res[4],
                        "maxPitch": res[5],
                        "imagePath": res[6],
                        "letters": letters
                    }
                )

        return jsonify(response)

    elif req_method == "POST":
        body = request.json

        # Check if first layer of schema has all mandatory fields
        body_fields = ["uploadId", "minPitch", "maxPitch", "letters", "creator", "imagePath", "accentIndex"]
        for field in body_fields:
            if field not in body:
                return {"isSuccessful": False, "description": "1 or more required request body fields missing"}, 400

        # Check if all letters contain all required schema fields
        letter_fields = ["syllable", "t0", "t1", "pitch", "isManualPitch", "isWordSep"]
        for letter in body["letters"]:
            for field in letter_fields:
                if field not in letter:
                    return {"isSuccessful": False, "description": "1 or more required letters are missing 1 or more required fields"}, 400

        num_syllables = len(body["letters"])


        with Postgres() as connection:

            # Create a new Word record for this word
            word_insert_query = """
                                    INSERT INTO word(
                                                        id, user_id, num_syllables, accent_index, min_pitch, max_pitch, 
                                                        image_path
                                                    )
                                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                                """

            word_record_to_insert = (
                                        body["uploadId"], body["creator"], num_syllables, body["accentIndex"],
                                        body["minPitch"], body["maxPitch"], body["imagePath"]
                                    )

            connection.execute_insert_query(word_insert_query, word_record_to_insert, False)

            word_id = body["uploadId"]
            for order_index in range(len(body["letters"])):
                letter = body["letters"][order_index]
                letter_insert_query = """
                                            INSERT INTO letter
                                                        (
                                                            id, syllable, word_id, t0, t1, pitch, is_manual_pitch, 
                                                            is_word_sep, order_index
                                                        )
                                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                                      """

                letter_id = str(uuid.uuid4().hex)
                letter_record_to_insert = (
                                            letter_id, letter["syllable"], word_id, letter["t0"], letter["t1"], letter["pitch"],
                                            letter["isManualPitch"], letter["isWordSep"], order_index
                                          )

                connection.execute_insert_query(letter_insert_query, letter_record_to_insert, False)

        return jsonify({"isSuccessful": True, 'word': word_id, 'creator': body["creator"], 'numSyllables': len(body["letters"])})


@app.route('/draw-sound/<string:upload_id>.png/image', methods=["GET"])
def drawSound(upload_id):
    sound_path = os.path.join(app.config["SOUNDS"], upload_id)

    script = praat._scripts_dir + "getBounds"
    output = praat.runScript(script, [upload_id, praat._sounds_dir])
    res = output.split()  # Split output into an array

    # Get last modified time of the sound file
    # Should think about either changing the service name,
    # or obtaining last modified time using a different service
    lastModifiedTime = time.ctime(os.path.getctime(sound_path))

    # Get URL parameters
    showSpectrogram = '0' if request.args.get("spectrogram") is None else '1'
    showPitch = '0' if request.args.get("pitch") is None else '1'
    showIntensity = '0' if request.args.get("intensity") is None else '1'
    showFormants = '0' if request.args.get("formants") is None else '1'
    showPulses = '0' if request.args.get("pulses") is None else '1'

    # Script file
    script = praat._scripts_dir + "drawSpectrogram"

    # Parameters to the script
    params = [upload_id, str(float(res[0])), str(float(res[2])),
             showSpectrogram, showPitch, showIntensity, showFormants, showPulses,
              praat._sounds_dir, praat._images_dir]

    # Image name will be a combination of relevant params joined by a period.
    image = 'src/metilda/' + praat._images_dir + ".".join(params[:-2]) + ".png"

    # Add image name to params list
    params.append(praat._images_dir + ".".join(params[:-2]) + ".png")

    # If image does not exist, run script
    if not os.path.isfile(image):
       praat.runScript(script, params)
       utils.resizeImage(image)

    # Image should be available now, generated or cached
    resp = app.make_response(open(image).read())
    resp.content_type = "image/png"
    os.remove(image)
    #os.remove(sound_path)
    return resp

@app.route('/draw-sound/<sound>/<startTime>/<endTime>', methods=["GET"])
def drawSoundWithTime(sound, startTime, endTime):

    # Get URL parameters
    showSpectrogram = '0' if request.args.get("spectrogram") is None else '1'
    showPitch = '0' if request.args.get("pitch") is None else '1'
    showIntensity = '0' if request.args.get("intensity") is None else '1'
    showFormants = '0' if request.args.get("formants") is None else '1'
    showPulses = '0' if request.args.get("pulses") is None else '1'

    # Script file
    script = praat._scripts_dir + "drawSpectrogram";

    # Parameters to the script
    params = [sound, startTime, endTime,
             showSpectrogram, showPitch, showIntensity, showFormants, showPulses, 
             praat._sounds_dir, praat._images_dir];

    # Image name will be a combination of relevant params joined by a period.
    image = 'src/metilda/' + praat._images_dir + ".".join(params[:-2]) + ".png"

    # Add image name to params list
    params.append(praat._images_dir + ".".join(params[:-2]) + ".png")

    # If image does not exist, run script
    if not os.path.isfile(image):
       praat.runScript(script, params)
       utils.resizeImage(image)

    # Image should be available now, generated or cached
    resp = app.make_response(open(image).read())
    resp.content_type = "image/png"
    os.remove(image)
    return resp

@app.route('/get-bounds/<sound>', methods=["GET"])
def getBounds(sound):
    script = praat._scripts_dir + "getBounds"
    output = praat.runScript(script, [sound, praat._sounds_dir])
    res = output.split() # Split output into an array

    # Create JSON object to return
    bounds = {
        "start": float(res[0]),
        "end": float(res[2]),
        "min": float(res[4]),
        "max": float(res[6])
    }
    return jsonify(bounds)

@app.route('/get-energy/<sound>', methods=["GET"])
def getEnergy(sound):
    script = praat._scripts_dir + "getEnergy"
    return jsonify({"energy": praat.runScript(script, [sound, praat._sounds_dir])}) 

@app.route('/pitch/count-voiced-frames/<sound>', methods=["GET"])
def countVoicedFrames(sound):
    script = praat._scripts_dir + "countVoicedFrames"
    return jsonify({"voicedFrames": praat.runScript(script, [sound, praat._sounds_dir])})

@app.route('/pitch/value-at-time/<sound>/<time>', methods=["GET"])
def pitchValueAtTime(sound, time):
    script = praat._scripts_dir + "pitchValueAtTime"
    return jsonify({"pitchValueAtTime": praat.runScript(script, [sound, time, praat._sounds_dir])})

@app.route('/pitch/value-in-frame/<sound>/<frame>', methods=["GET"])
def pitchValueInFrame(sound, frame):
    script = praat._scripts_dir + "pitchValueInFrame"
    return jsonify({"pitchValueInFrame": praat.runScript(script, [sound, frame, praat._sounds_dir])}) 

@app.route('/spectrum/get-bounds/<sound>', methods=["GET"])
def spectrumFrequencyBounds(sound):
    # Script file
    script = praat._scripts_dir + "spectrumFreqBounds"

    # Run script and get output
    output = praat.runScript(script, [sound, praat._sounds_dir])

    # Split output into an array
    res = output.split()

    # Create JSON object to return
    bounds = {
       "lowFrequency": float(res[0]),
       "highFrequency": float(res[2])
    }

    return jsonify(bounds)

@app.route('/intensity/get-bounds/<sound>', methods=["GET"])
def intensityBounds(sound):
    # Patht to script
    script = praat._scripts_dir + "intensityBounds"

    # Run script
    output = praat.runScript(script, [sound, praat._sounds_dir])

    # Split output into an array
    res = output.split()

    # Create JSON object to return
    bounds = {
       "minIntensity": float(res[0]),
       "maxIntensity": float(res[2]),
       "meanIntensity": float(res[4])
    }

    return jsonify(bounds)   

@app.route('/formant/number-of-frames/<sound>', methods=["GET"])
def formantFrameCount(sound):
    script = praat._scripts_dir + "formantFrameCount"
    return jsonify({"noOfFrames": praat.runScript(script, [sound, praat._sounds_dir])})

@app.route('/formant/number-of-formants/<sound>/<frame>', methods=["GET"])
def formantCountAtFrame(sound, frame):
    script = praat._scripts_dir + "formantCount"
    return jsonify({"noOfFormants": praat.runScript(script, [sound, frame, praat._sounds_dir])})

@app.route('/formant/value-at-time/<sound>/<formantNumber>/<time>', methods=["GET"])
def formantValueAtTime(sound, formantNumber, time):
    script = praat._scripts_dir + "formantValueAtTime"
    return jsonify({"formantValueAtTime": praat.runScript(script, [sound, formantNumber, time, praat._sounds_dir])})

@app.route('/harmonicity/get-min/<sound>/<start>/<end>', methods=["GET"])
def harmonicityGetMin(sound, start, end):
    script = praat._scripts_dir + "harmonicityGetMin"
    return jsonify({"minHarmonicity": praat.runScript(script, [sound, start, end, praat._sounds_dir])})

@app.route('/harmonicity/get-max/<sound>/<start>/<end>', methods=["GET"])
def harmonicityGetMax(sound, start, end):
    script = praat._scripts_dir + "harmonicityGetMax"
    return jsonify({"maxHarmonicity": praat.runScript(script, [sound, start, end, praat._sounds_dir])})

@app.route('/harmonicity/value-at-time/<sound>/<time>', methods=["GET"])
def harmonicityValueAtTime(sound, time):
    script = praat._scripts_dir + "harmonicityGetValueAtTime"
    return jsonify({"harmonicityValueAtTime": praat.runScript(script, [sound, time, praat._sounds_dir])})

@app.route('/pointprocess/number-of-periods/<sound>/<start>/<end>', methods=["GET"])
def pointProcessGetNumPeriods(sound, start, end):
    script = praat._scripts_dir + "pointProcessGetNumPeriods"
    return jsonify({"noOfPeriods": praat.runScript(script, [sound, start, end, praat._sounds_dir])})

@app.route('/pointprocess/number-of-points/<sound>', methods=["GET"])
def pointProcessGetNumPoints(sound):
    script = praat._scripts_dir + "pointProcessGetNumPoints"
    return jsonify({"noOfPoints": praat.runScript(script, [sound, praat._sounds_dir])})

@app.route('/pointprocess/get-jitter/<sound>/<start>/<end>', methods=["GET"])
def pointProcessGetJitter(sound, start, end):
    script = praat._scripts_dir + "pointProcessGetJitter"
    return jsonify({"localJitter": praat.runScript(script, [sound, start, end, praat._sounds_dir])})

@app.route('/annotation/<eaffilename>/<sound>/<start>/<end>/<text0>/<text1>/<text2>/<text3>/<text4>/<text5>', methods=["GET"])
def annotationTimeSelection(eaffilename, sound, start, end, text0, text1, text2, text3, text4, text5):
    x = sound.index('.')
    nameoffile = eaffilename

    if text0 == "EMPTY":
        text0 = ""
    if text1 == "EMPTY":
        text1 = ""
    if text2 == "EMPTY":
        text2 = ""
    if text3 == "EMPTY":
        text3 = ""
    if text4 == "EMPTY":
        text4 = ""
    if text5 == "EMPTY":
        text5 = ""

    #Create a new EAF file
    filepath = praat._eaf_dir + nameoffile + ".eaf"
    startTime = int(round(float(start)))
    endTime = int(round(float(end)))

    # Initialize the elan file
    eafob = pympi.Elan.Eaf()

    #Add linguistic type constraint - right now just one - Time_Subdivision
    ltype = "TimeSubdivision-lt"
    ltcon = "Time_Subdivision"

    #prep variables for media descriptor
    soundpath = praat._sounds_dir + sound
    soundpath_url = pathlib.Path(soundpath)
    relpath = "./" + sound
    mimetype = "audio/" + sound[x+1:len(sound)]

    #set media descriptor
    if(soundpath != ""):
        eafob.add_linked_file(soundpath_url, relpath, mimetype) 

    defaulttier = "default"
    tier1 = "Tier1"
    tier2 = "Tier2" 
    tier3 = "Tier3"
    tier4 = "Tier4"
    tier5 = "Tier5"

    if (text0 != "undefined" and text0 != ""):
        eafob.add_annotation(defaulttier, startTime, endTime, text0)
        eafob.add_linguistic_type(ltype, ltcon)
    if (text1 != "undefined" and text1 != ""):
        eafob.add_tier(tier1, ltype)
        eafob.add_annotation(tier1, startTime, endTime, text1)
    if (text2 != "undefined" and text2 != ""):
        eafob.add_tier(tier2, ltype)
        eafob.add_annotation(tier2, startTime, endTime, text2)
    if (text3 != "undefined" and text3 != ""):
        eafob.add_tier(tier3, ltype)
        eafob.add_annotation(tier3, startTime, endTime, text3)
    if (text4 != "undefined" and text4 != ""):
        eafob.add_tier(tier4, ltype)
        eafob.add_annotation(tier4, startTime, endTime, text4)
    if (text5 != "undefined" and text5 != ""):
        eafob.add_tier(tier5, ltype)
        eafob.add_annotation(tier5, startTime, endTime, text5)

    #Write the object to a file
    if(filepath != ""):
        eafob.to_file(filepath)
      
    xmlObject = etree.parse(filepath)
    eafstring = etree.tostring(xmlObject, pretty_print = True)
    os.remove(filepath)

    return eafstring
