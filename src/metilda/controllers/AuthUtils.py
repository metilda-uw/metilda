from flask import request, jsonify
from .Postgres import Postgres
from metilda import app

@app.route('/cms/authentication/verification/teacher', methods=["POST"])
def verify_teacher():
    with Postgres() as connection:
        query = 'select user_role from user_role where (user_id=%s and user_role=%s and verified=true) \
        or (user_id=%s and user_role=%s and verified=true)'
        args = (request.form['user'],'Teacher',request.form['user'],'Admin')
        res=connection.execute_select_query(query, args)
        if not res:
            return jsonify({}),403

    return jsonify({'result':'verified'})

@app.route('/cms/authentication/verification/teacher_course', methods=["POST"])
def verify_teacher_course():
    with Postgres() as connection:
        query = 'select user_role from user_role where (user_id=%s and user_role=%s and verified=true) \
        or (user_id=%s and user_role=%s and verified=true)'
        args = (request.form['user'],'Teacher',request.form['user'],'Admin')
        res=connection.execute_select_query(query, args)
        if not res:
            return jsonify({}),403
        if res[0][0]=='Teacher':
            query = 'select * from teacher_course where teacher_id=%s and course_id=%s'
            args = (request.form['user'],request.form['course'])
            res=connection.execute_select_query(query, args)
            if not res:
                return jsonify({}),403

    return jsonify({'result':'verified'})

@app.route('/cms/authentication/verification/student', methods=["POST"])
def verify_student():
    with Postgres() as connection:
        query = 'select user_role from user_role where (user_id=%s and user_role=%s) \
        or (user_id=%s and user_role=%s and verified=true)'
        args = (request.form['user'],'Student',request.form['user'],'Admin')
        res=connection.execute_select_query(query, args)
        if not res:
            return jsonify({}),403

    return jsonify({'result':'verified'})

@app.route('/cms/authentication/verification/student_course', methods=["POST"])
def verify_student_course():
    with Postgres() as connection:
        query = 'select user_role from user_role where (user_id=%s and user_role=%s) \
        or (user_id=%s and user_role=%s and verified=true)'
        args = (request.form['user'],'Student',request.form['user'],'Admin')
        res=connection.execute_select_query(query, args)
        if not res:
            return jsonify({}),403
        if res[0][0]=='Student':
            query = 'select * from student_course where student_id=%s and course_id=%s'
            args = (request.form['user'],request.form['course'])
            res=connection.execute_select_query(query, args)
            if not res:
                return jsonify({}),403

    return jsonify({'result':'verified'})

    