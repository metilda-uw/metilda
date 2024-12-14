from flask import request, jsonify
from metilda import app
from uuid import uuid4
from datetime import datetime,timezone
import json
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

@app.route('/student-view/activities', methods=["POST"])
def get_activity_content():
    # Extract course number from the request body
    course_id = request.form['course']

    with Postgres() as connection:
        # Query to fetch activities based on the provided course number
        query = '''
            SELECT activity_number, word, image_url
            FROM activity_content
            WHERE course_no = %s
        '''
        args = (course_id,)
        activities = connection.execute_select_query(query, args)

    # Process the fetched activities into the required JSON format
    activity_result = {}
    for activity_number, word, image_url in activities:
        # Ensure proper decoding of 'word' to handle special characters
        if activity_number not in activity_result:
            activity_result[activity_number] = {}
        activity_result[activity_number][word] = image_url

    # Return the JSON response with ensure_ascii=False to preserve special characters
    return app.response_class(
        response=json.dumps(activity_result, ensure_ascii=False),
        mimetype='application/json'
    )

@app.route('/student-view/assignment_grades', methods=["POST"])
def get_assignment_grades():
    # Get the user's course input
    course_id = request.form['course']
    current_user_email = request.form.get("user")  # Email of the logged-in user

    with Postgres() as connection:
        # Fetch assignments for the course
        assignments_query = '''
            SELECT id, name, available, deadline, description, max_grade, weight 
            FROM assignments 
            WHERE course = %s
        '''
        assignments = connection.execute_select_query(assignments_query, (course_id,))


        if not assignments:
            return jsonify({"error": "No assignments found for this course"}), 404

        # Extract assignment IDs
        assignment_ids = tuple(assignment[0] for assignment in assignments)

        if not assignment_ids:
            return jsonify({"error": "No valid assignment IDs found"}), 404

        # Fetch grades for these assignments using IN clause
        grades_query = '''
            SELECT gradable_id, grade, user_id
            FROM gradable_grades 
            WHERE gradable_id IN %s
        '''
        grades = connection.execute_select_query(grades_query, (assignment_ids,))

        if not grades:
            return jsonify({"error": "No grades found for these assignments"}), 404

        # Organize grades by assignment ID
        assignment_scores = {}
        for gradable_id, grade, user_id in grades:
            if grade != -1:  # Ignore invalid grades
                if gradable_id not in assignment_scores:
                    assignment_scores[gradable_id] = []
                assignment_scores[gradable_id].append((grade, user_id))

        # Prepare the result with additional metrics
        result = []
        gradable_ids = {gradable_id for gradable_id, _, _ in grades}
        for assignment in assignments:
            assignment_id, name, available, deadline, description, max_grade, weight = assignment
            if assignment_id in gradable_ids:
                scores = [score for score, _ in assignment_scores.get(assignment_id, [])]

                user_grade=0
                
                # Calculate metrics if there are valid scores
                if scores:
                    lowest_score = min(scores)
                    average_score = sum(scores) / len(scores)
                    highest_score = max(scores)

                    # Calculate the current user's percentile if email is provided
                    user_grade = next(
                        (grade for grade, uid in assignment_scores.get(assignment_id, []) if uid == current_user_email),
                        None
                    )

                    if user_grade is not None:
                        sorted_scores = sorted(scores)
                        percentile_rank = (sorted_scores.index(user_grade) / len(sorted_scores)) * 100
                    else:
                        percentile_rank = None
                else:
                    lowest_score = average_score = highest_score = percentile_rank = None

                # Add assignment details to the result
                result.append({
                    'assignment_id': assignment_id,
                    'name': name,
                    'available': available,
                    'deadline': deadline,
                    'description': description,
                    'user_grade': round(user_grade, 2) if user_grade is not None else None,
                    'max_grade': round(max_grade, 2) if max_grade is not None else None,
                    'weight': round(weight, 2) if weight is not None else None,
                    'lowest_score': round(lowest_score, 2) if lowest_score is not None else None,
                    'average_score': round(average_score, 2) if average_score is not None else None,
                    'highest_score': round(highest_score, 2) if highest_score is not None else None,
                    'percentile': round(percentile_rank, 2) if percentile_rank is not None else None
                })
    return jsonify(result)


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
        args = (id,request.form['assignment'],request.form['user'],datetime.now(timezone.utc),
                request.form['content'],-1.0,request.form['max_grade'])
        connection.execute_insert_query(query, args, False)

    return jsonify({})

@app.route('/student-view/assignment/submission/update', methods=["POST"])
def student_update_submission():
    with Postgres() as connection:
        query = 'update assignment_submissions set content=%s,time=%s,grade=%s,comment=%s where user_id=%s and assignment=%s'
        args = (request.form['content'],datetime.now(timezone.utc),-1.0,'',request.form['user'],request.form['assignment'])
        connection.execute_update_query(query, args)

    return jsonify({})
