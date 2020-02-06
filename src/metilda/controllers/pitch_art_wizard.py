from __future__ import with_statement
import os
import shutil
import tempfile
from flask import request, jsonify, send_file, flash
from Postgres import Postgres
from metilda import app
from metilda.default import MIN_PITCH_HZ, MAX_PITCH_HZ
from metilda.services import audio_analysis, file_io
from werkzeug.utils import secure_filename
import firebase_admin
from firebase_admin import credentials, db, auth
import wave


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

@app.route('/api/delete-file/', methods=["POST"])
def delete_file():
    with Postgres() as connection:
        postgres_select_query = """ DELETE FROM audio WHERE AUDIO_ID = %s"""
        results = connection.execute_update_query(postgres_select_query, (request.form['file_id'],))
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

@app.route('/api/insert-image-analysis-ids', methods=["POST"])
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

@app.route('/api/get-all-images/<string:user_id>', methods=["GET"])
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
   
   