from flask import request, jsonify
from .Postgres import Postgres
from metilda import app
from uuid import uuid4

@app.route('/file/create', methods=["POST"])
def util_create_file():
    with Postgres() as connection:
        query = 'insert into files values(%s,%s,%s,%s,%s,%s)'
        args = (request.form['user_id'], request.form['file_name'], request.form['file_path'],request.form['file_type'], 
                request.form['file_size'],request.form['course'])
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/file/delete', methods=["POST"])
def util_delete_file():
    with Postgres() as connection:
        if(request.form['old_path']):
            query = 'delete from files where path=%s'
            args=(request.form['old_path'],)
            connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/file/read/<string:course>/<string:type>', methods=["GET"])
def util_get_file(course,type):
    with Postgres() as connection:
        query = 'select * from files where course=%s and type=%s'

        args= (course,type)

        results = connection.execute_select_query(query, args)
        return jsonify({'result': results})