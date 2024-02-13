from flask import request, jsonify
from metilda import app
from uuid import uuid4

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from Postgres import Postgres

@app.route('/student-view/assignments', methods=["POST"])
def student_read_assignments():
    with Postgres() as connection:
        query = 'select id,name,available,deadline,description,max_grade from assignments where course=%s and available=true'
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

@app.route('/student-view/assignments/read', methods=["POST"])
def student_read_assignment():
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


@app.route('/student-view/assignment/file/read/<string:course>/<string:type>/<string:assignment>', methods=["GET"])
def student_assignment_get_file(course,type,assignment):
    with Postgres() as connection:
        query = 'select * from assignment_files where course=%s and type=%s and assignment=%s'

        args= (course,type,assignment)

        results = connection.execute_select_query(query, args)
        return jsonify({'result': results})
    


@app.route('/student-view/assignment/submission/file/read/<string:user>/<string:assignment>', methods=["GET"])
def student_assignment_get_submission_file(user,assignment):
    with Postgres() as connection:
        query = 'select * from assignment_submission_files where user_id=%s and assignment=%s'

        args= (user,assignment)

        results = connection.execute_select_query(query, args)
        return jsonify({'result': results})
    
@app.route('/student-view/assignment/submission/file/create', methods=["POST"])
def student_assignment_submission_create_file():
    with Postgres() as connection:
        query = 'insert into assignment_submission_files values(%s,%s,%s,%s,%s,%s,%s)'
        args = (request.form['user_id'], request.form['file_name'], request.form['file_path'],request.form['file_type'], 
                request.form['file_size'],request.form['assignment'],int(request.form['course']))
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/student-view/assignment/submission/file/delete', methods=["POST"])
def student_assignment_submission_delete_file():
    with Postgres() as connection:
        if(request.form['old_path']):
            query = 'delete from assignment_submission_files where path=%s'
            args=(request.form['old_path'],)
            connection.execute_update_query(query, args)
    return jsonify({})


@app.route('/student-view/assignment/submission/read', methods=["POST"])
def student_read_submission():
    with Postgres() as connection:
        query = 'select time,content,grade,max_grade,comment from assignment_submissions where user_id=%s and assignment=%s'
        args = (request.form['user'],request.form['assignment'])
        result = connection.execute_select_query(query, args)
        if result:
            result=result[0]
            res={
                'time':result[0],
                'content':result[1],
                'grade':result[2],
                'max_grade':result[3],
                'comment':result[4]
            }
        else:
            res={}

    return jsonify(res)

@app.route('/student-view/assignment/submission/create', methods=["POST"])
def student_create_submission():
    with Postgres() as connection:
        id=str(uuid4())
        query = 'insert into assignment_submissions(id,assignment,user_id,time,content,grade,max_grade) values(%s,%s,%s,%s,%s,%s,%s)'
        args = (id,request.form['assignment'],request.form['user'],request.form['time'],
                request.form['content'],-1.0,request.form['max_grade'])
        connection.execute_insert_query(query, args, False)

    return jsonify({})

@app.route('/student-view/assignment/submission/update', methods=["POST"])
def student_update_submission():
    with Postgres() as connection:
        query = 'update assignment_submissions set content=%s,time=%s,grade=%s,comment=%s where user_id=%s and assignment=%s'
        args = (request.form['content'],request.form['time'],-1.0,'',request.form['user'],request.form['assignment'])
        connection.execute_update_query(query, args)

    return jsonify({})
