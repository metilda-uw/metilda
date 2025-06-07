from flask import request, jsonify
from metilda import app
from metilda.cache import cache
from uuid import uuid4
import numpy as np

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from Postgres import Postgres

def clear_teacher_assignment_cache():
    keys_to_delete = [key for key in cache.cache._cache if "assignment" in key]
    for key in keys_to_delete:
        cache.delete(key)


@app.route('/cms/assignments/create', methods=["POST"])
def teacher_assignment_create():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        id=str(uuid4())
        query = 'insert into assignments(id,name,course,available,deadline,description,max_grade,weight) values(%s,%s,%s,%s,%s,%s,%s,%s)'
        args = (id,request.form['name'],int(request.form['course']),bool(request.form['available']),
                request.form['deadline'],request.form['description'],request.form['max_grade'],request.form['weight'])
        connection.execute_insert_query(query, args, False)
        clear_teacher_assignment_cache()
        cache.delete("teacher_assignmentGrade_get_all_clusters")

    return jsonify({'assignment':id})

@app.route('/cms/assignments', methods=["POST"])
@cache.memoize(500)
def teacher_assignment_getall():
    print("Fetching assignments from DB...")
    with Postgres() as connection:
        query = 'select id,name,available,deadline,description,max_grade,weight from assignments where course=%s'
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
@cache.memoize(500)
def teacher_assignment_get():
    with Postgres() as connection:
        # Fetch assignment details
        query = '''
            SELECT name, available, deadline, description, max_grade, weight 
            FROM assignments WHERE id = %s
        '''
        args = (request.form['assignment'],)
        result = connection.execute_select_query(query, args)[0]

        res = {
            'name': result[0],
            'available': result[1],
            'deadline': result[2],
            'description': result[3],
            'max_grade': result[4],
            'weight': result[5]
        }
    return jsonify(res)

@app.route('/cms/assignments/read/with_count', methods=["POST"])
def teacher_assignment_get_withcount():
    assignment_id = request.form['assignment_id']
    course_id = request.form['course_id']
    
    with Postgres() as connection:
        # Fetch assignment details
        query = '''
            SELECT name, available, deadline, description, max_grade, weight, posted 
            FROM assignments WHERE id = %s
        '''
        result = connection.execute_select_query(query, (assignment_id,))[0]

        # Get graded, submissions, and total count
        graded_query = '''
            SELECT COUNT(DISTINCT gg.user_id) 
            FROM gradable_grades gg
            JOIN gradables g ON gg.gradable_id = g.id 
            JOIN student_course s ON gg.user_id = s.student_id
            WHERE s.course_id = %s AND g.id = %s AND gg.grade IS NOT NULL AND gg.grade <> -1;
        '''
        submissions_query = '''
            SELECT COUNT(DISTINCT a.user_id)
            FROM assignment_submissions a
            JOIN student_course s ON a.user_id = s.student_id
            WHERE a.assignment = %s AND s.course_id = %s;
        '''
        total_count_query = '''
            SELECT COUNT(DISTINCT student_id)
            FROM student_course
            WHERE course_id = %s;
        '''
        
        graded_count = connection.execute_select_query(graded_query, (course_id, assignment_id))[0][0]
        submissions_count = connection.execute_select_query(submissions_query, (assignment_id, course_id))[0][0]
        total_students = connection.execute_select_query(total_count_query, (course_id,))[0][0]
        
        res = {
            'name': result[0],
            'available': result[1],
            'deadline': result[2],
            'description': result[3],
            'max_grade': result[4],
            'weight': result[5],
            'posted': result[6],
            'graded_count': graded_count,
            'needs_grading_count': submissions_count - graded_count,
            'not_submitted_count': total_students - submissions_count
        }
    
    return jsonify(res)

@app.route('/cms/assignments/not_submitted_students', methods=["POST"])
def teacher_assignment_notsubmittedlist():
    assignment_id = request.form['assignment_id']
    course_id = request.form['course_id']

    with Postgres() as connection:
        query = '''
            SELECT sc.student_id 
            FROM student_course sc
            WHERE sc.course_id = %s
            AND sc.student_id NOT IN (
                SELECT DISTINCT a.user_id
                FROM assignment_submissions a
                WHERE a.assignment = %s
            );
        '''
        
        students_not_submitted = connection.execute_select_query(query, (course_id, assignment_id))

    return jsonify({'not_submitted_students': [s[0] for s in students_not_submitted]})

@app.route('/cms/assignments/update', methods=["POST"])
def teacher_assignment_update():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update assignments set name=%s,available=%s,deadline=%s,description=%s,max_grade=%s,weight=%s where id=%s'
        args = (request.form['name'],request.form['available'],request.form['deadline'],request.form['description'],
                float(request.form['max_grade']),request.form['weight'],request.form['assignment'])
        result = connection.execute_update_query(query, args)
        clear_teacher_assignment_cache()
        cache.delete("teacher_assignmentGrade_get_all_clusters")

    return jsonify({})

@app.route('/cms/assignments/delete', methods=["POST"])
def teacher_assignment_delete():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from assignments where id=%s'
        args=(request.form['assignment'],)
        result = connection.execute_update_query(query, args)
        clear_teacher_assignment_cache()
    return jsonify({})


@app.route('/cms/assignment/file/create', methods=["POST"])
def teacher_assignment_create_file():
    with Postgres() as connection:
        query = 'insert into assignment_files values(%s,%s,%s,%s,%s,%s,%s)'
        args = (request.form['user_id'], request.form['file_name'], request.form['file_path'],request.form['file_type'], 
                request.form['file_size'],request.form['assignment'],request.form['course'])
        connection.execute_insert_query(query, args, False)
        clear_teacher_assignment_cache()
    return jsonify({})

@app.route('/cms/assignment/file/delete', methods=["POST"])
def teacher_assignment_delete_file():
    with Postgres() as connection:
        if(request.form['old_path']):
            query = 'delete from assignment_files where path=%s'
            args=(request.form['old_path'],)
            connection.execute_update_query(query, args)
            clear_teacher_assignment_cache()
    return jsonify({})

@app.route('/cms/assignment/file/read/<string:course>/<string:type>/<string:assignment>', methods=["GET"])
def teacher_assignment_get_file(course,type,assignment):
    with Postgres() as connection:
        query = 'select * from assignment_files where course=%s and type=%s and assignment=%s'

        args= (course,type,assignment)

        results = connection.execute_select_query(query, args)
        clear_teacher_assignment_cache()
        return jsonify({'result': results})
        
@app.route('/cms/assignment/post_scores', methods=["POST"])
def teacher_assignment_post_scores():
    assignment_id = request.form['assignment_id']
    with Postgres() as connection:
        # Update query to set posted as true
        update_query = '''
            UPDATE assignments
            SET posted = TRUE
            WHERE id = %s
            RETURNING id, name, posted;
        '''
        
        result = connection.execute_update_query(update_query, (assignment_id,))
        
        if not result:
            return jsonify({"error": "Assignment not found or update failed"}), 404

        # Optionally, clear cache if needed
        clear_teacher_assignment_cache()

        return jsonify({"message": "Assignment successfully posted", "assignment": result}), 200


@app.route('/cms/assignments/submissions', methods=["POST"])
def teacher_assignment_submissions():
    assignment_id = request.form.get('assignment_id')

    if not assignment_id:
        return jsonify({"error": "Missing assignment_id"}), 400

    with Postgres() as connection:
        # Fetch all necessary details for ungraded submissions
        submission_query = '''
            WITH submissions AS (
                SELECT DISTINCT user_id
                FROM assignment_submissions
                WHERE assignment = %s
            ),
            files AS (
                SELECT 
                    user_id, 
                    assignment, 
                    json_agg(json_build_object('name', name, 'path', path)) AS submitted_files
                FROM assignment_submission_files
                WHERE assignment = %s
                GROUP BY user_id, assignment
            ),
            grades AS (
                SELECT DISTINCT ON (gg.user_id)
                    gg.user_id, 
                    gg.grade AS score,
                    gg.comment AS comment  -- Fetch comment if not empty
                FROM gradable_grades gg
                LEFT JOIN assignment_submissions asub 
                ON gg.user_id = asub.user_id 
                AND asub.assignment = %s
                WHERE gg.gradable_id = %s  -- Ensure matching gradable_id
                ORDER BY gg.user_id, gg.grade DESC  -- Ensures one grade per user
            ),
            max_grade AS (
                SELECT id AS gradable_id, max_grade
                FROM gradables
                WHERE id = %s
            )
            SELECT 
                s.user_id, 
                COALESCE(g.score, NULL) AS score,
                COALESCE(g.comment, NULL) AS comment,
                mg.max_grade,
                COALESCE(f.submitted_files, '[]'::json) AS submitted_files
            FROM submissions s
            LEFT JOIN grades g ON s.user_id = g.user_id
            LEFT JOIN max_grade mg ON mg.gradable_id = %s
            LEFT JOIN files f ON s.user_id = f.user_id
        '''

        connection.cursor.execute(
            submission_query,
            (assignment_id, assignment_id, assignment_id, assignment_id, assignment_id, assignment_id)
        )
        submissions = connection.cursor.fetchall()

        submissions_data = [
            {
                "user_id": sub[0],
                "score": sub[1],  # Score from gradable_grades (if present)
                "comment": sub[2],  # Comment from gradable_grades (if present)
                "max_grade": sub[3],  # Max grade from gradables
                "submitted_files": sub[4]  # List of submitted files
            }
            for sub in submissions
        ]

    return jsonify(submissions_data)

@app.route('/cms/assignments/saveGrade', methods=["POST"])
def teacher_assignment_save_grade():
    assignment_id = request.form.get("assignment_id")
    user_id = request.form.get("user_id")
    grade = request.form.get("grade")
    comment = request.form.get("comment")

    if not assignment_id or not user_id or grade is None:
        return jsonify({"error": "Missing required fields"}), 400

    with Postgres() as connection:
        # Check if the record already exists
        check_query = '''
            SELECT * FROM gradable_grades WHERE gradable_id = %s AND user_id = %s
        '''
        connection.cursor.execute(check_query, (assignment_id, user_id))
        existing_record = connection.cursor.fetchone()

        if existing_record:
            # Update existing grade and comment
            update_query = '''
                UPDATE gradable_grades 
                SET grade = %s, comment = %s
                WHERE gradable_id = %s AND user_id = %s
            '''
            connection.cursor.execute(update_query, (grade, comment, assignment_id, user_id))
        else:
            # Insert new record
            insert_query = '''
                INSERT INTO gradable_grades (gradable_id, user_id, grade, comment)
                VALUES (%s, %s, %s, %s)
            '''
            connection.cursor.execute(insert_query, (assignment_id, user_id, grade, comment))

        connection.connection.commit()
        clear_teacher_assignment_cache()
        cache.delete("teacher_assignmentGrade_get_all_clusters")

    return jsonify({"message": "Grade saved successfully"}), 200
