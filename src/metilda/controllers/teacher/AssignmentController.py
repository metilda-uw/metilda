from flask import request, jsonify
from metilda import app
from uuid import uuid4
from sklearn.cluster import KMeans
import numpy as np

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
        query = 'insert into assignments(id,name,course,available,deadline,description,max_grade,weight) values(%s,%s,%s,%s,%s,%s,%s,%s)'
        args = (id,request.form['name'],int(request.form['course']),bool(request.form['available']),
                request.form['deadline'],request.form['description'],request.form['max_grade'],request.form['weight'])
        connection.execute_insert_query(query, args, False)

    return jsonify({'assignment':id})

@app.route('/cms/assignments', methods=["POST"])
def read_assignments():
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

@app.route('/cms/assignment_clusters', methods=["POST"])
def get_assignment_clusters():
    course_id = request.form['course']

    with Postgres() as connection:
        # Fetch assignments for the course with their names
        assignments_query = '''
            SELECT id, name 
            FROM assignments 
            WHERE course = %s
        '''
        assignments = connection.execute_select_query(assignments_query, (course_id,))
        assignment_map = {assignment[0]: assignment[1] for assignment in assignments}
        assignment_ids = tuple(assignment_map.keys())

        if not assignment_ids:
            return jsonify({"error": "No valid assignment IDs found"}), 404

        # Fetch grades for these assignments
        grades_query = '''
            SELECT gradable_id, grade, user_id
            FROM gradable_grades 
            WHERE gradable_id IN %s
        '''
        grades = connection.execute_select_query(grades_query, (assignment_ids,))

        if not grades:
            return jsonify({"error": "No grades found"}), 404

        # Organize grades by assignment ID
        assignment_scores = {}
        for gradable_id, grade, user_id in grades:
            if grade != -1:  # Ignore invalid grades
                if gradable_id not in assignment_scores:
                    assignment_scores[gradable_id] = []
                assignment_scores[gradable_id].append((grade, user_id))

        result = []
        for assignment_id, scores_with_users in assignment_scores.items():
            if scores_with_users:
                # Prepare data for KMeans
                scores = [score for score, _ in scores_with_users]
                scores_array = np.array(scores).reshape(-1, 1)

                # Apply KMeans
                kmeans = KMeans(n_clusters=min(3, len(scores)), random_state=42)
                kmeans.fit(scores_array)

                # Collect cluster data with user emails
                cluster_data = [
                    {'score': score, 'user_id': user_id, 'cluster': int(label)}
                    for (score, user_id), label in zip(scores_with_users, kmeans.labels_)
                ]

                centroids = kmeans.cluster_centers_.flatten().tolist()

                result.append({
                    'id': assignment_id,
                    'name': assignment_map[assignment_id],  # Include assignment name
                    'cluster_data': cluster_data,
                    'cluster_centroids': centroids
                })

    return jsonify(result)


@app.route('/cms/assignments/read', methods=["POST"])
def read_assignment():
    with Postgres() as connection:
        query = 'select name,available,deadline,description,max_grade,weight from assignments where id=%s'
        args = (request.form['assignment'],)
        result = connection.execute_select_query(query, args)[0]
        res={
            'name':result[0],
            'available':result[1],
            'deadline':result[2],
            'description':result[3],
            'max_grade':result[4],
            'weight':result[5]
        }

    return jsonify(res)

@app.route('/cms/assignments/update', methods=["POST"])
def update_assignment():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update assignments set name=%s,available=%s,deadline=%s,description=%s,max_grade=%s,weight=%s where id=%s'
        args = (request.form['name'],request.form['available'],request.form['deadline'],request.form['description'],
                float(request.form['max_grade']),request.form['weight'],request.form['assignment'])
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
