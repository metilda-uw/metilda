from flask import request, jsonify
from metilda import app
from uuid import uuid4

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from Postgres import Postgres

@app.route('/cms/assignments/create', methods=["POST"])
def create_assignment():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        id=str(uuid4())
        query = 'insert into assignments(id,name,course,available,deadline,description,max_grade) values(%s,%s,%s,%s,%s,%s,%s)'
        args = (id,request.form['name'],int(request.form['course']),bool(request.form['available']),
                request.form['deadline'],request.form['description'],request.form['max_grade'])
        connection.execute_insert_query(query, args, False)

    return jsonify({'assignment':id})

@app.route('/cms/assignments', methods=["POST"])
def read_assignments():
    with Postgres() as connection:
        query = 'select id,name,available,deadline,description,max_grade from assignments where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
    return jsonify(list(map(lambda arr:{
        'assignment':arr[0],
        'name':arr[1],
        'available':arr[2],
        'deadline':arr[3],
        'description':arr[4],
        'max_grade':arr[5]
    },result)))

@app.route('/cms/assignments/read', methods=["POST"])
def read_assignment():
    with Postgres() as connection:
        query = 'select name,available,deadline,description,max_grade from assignments where id=%s'
        args = (request.form['assignment'],)
        result = connection.execute_select_query(query, args)[0]
        res={
            'name':result[0],
            'available':result[1],
            'deadline':result[2],
            'description':result[3],
            'max_grade':result[4]
        }

    return jsonify(res)

@app.route('/cms/assignments/update', methods=["POST"])
def update_assignment():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update assignments set name=%s,available=%s,deadline=%s,description=%s,max_grade=%s where id=%s'
        args = (request.form['name'],request.form['available'],request.form['deadline'],
                request.form['description'],float(request.form['max_grade']),request.form['assignment'])
        result = connection.execute_update_query(query, args)

    return jsonify({})

@app.route('/cms/assignments/delete', methods=["POST"])
def delete_assignment():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from assignments where id=%s'
        args=(request.form['assignment'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})


@app.route('/cms/assignment/file/create', methods=["POST"])
def assignment_create_file():
    with Postgres() as connection:
        query = 'insert into assignment_files values(%s,%s,%s,%s,%s,%s,%s)'
        args = (request.form['user_id'], request.form['file_name'], request.form['file_path'],request.form['file_type'], 
                request.form['file_size'],request.form['assignment'],request.form['course'])
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/cms/assignment/file/delete', methods=["POST"])
def assignment_delete_file():
    with Postgres() as connection:
        if(request.form['old_path']):
            query = 'delete from assignment_files where path=%s'
            args=(request.form['old_path'],)
            connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/assignment/file/read/<string:course>/<string:type>/<string:assignment>', methods=["GET"])
def assignment_get_file(course,type,assignment):
    with Postgres() as connection:
        query = 'select * from assignment_files where course=%s and type=%s and assignment=%s'

        args= (course,type,assignment)

        results = connection.execute_select_query(query, args)
        return jsonify({'result': results})
