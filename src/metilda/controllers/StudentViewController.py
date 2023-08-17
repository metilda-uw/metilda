from flask import request, jsonify
from .Postgres import Postgres
from metilda import app

# --------------------------- Course ---------------------------
@app.route('/student-view/courses', methods=["POST"])
def student_read_courses():
    with Postgres() as connection:
        query = 'select id,name from courses where id in (select course_id from student_course where student_id=%s) and available=true'
        args = (request.form['user'],)
        result = connection.execute_select_query(query, args)
    return jsonify(result)

@app.route('/student-view/courses/enroll', methods=["POST"])
def student_enroll_course():
    with Postgres() as connection:
        query = 'insert into student_course values(%s,%s)'
        args = (request.form['user'],int(request.form['course']))
        result = connection.execute_insert_query(query, args, False)
    return jsonify(result)

@app.route('/student-view/courses/read', methods=["POST"])
def student_read_course():
    with Postgres() as connection:
        query = 'select name,language,credits,schedule from courses where id=%s and available=true'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)[0]
    return jsonify({
                    'name':result[0],
                    'language':result[1],
                    'credits':result[2],
                    'schedule':result[3],
                    })


# --------------------------- Lesson -------------------------------
@app.route('/student-view/lessons', methods=["POST"])
def student_read_lessons():
    with Postgres() as connection:
        query = 'select id,name from lessons where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
    return jsonify(result)

@app.route('/student-view/lessons/read', methods=["POST"])
def student_read_lesson():
    with Postgres() as connection:
        query = 'select name,course from lessons where id=%s'
        args = (request.form['lessonId'],)
        result = connection.execute_select_query(query, args)[0]
    return jsonify({
                    'name':result[0],
                    'course':result[1]
                    })