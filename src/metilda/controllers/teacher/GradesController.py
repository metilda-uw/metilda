from flask import request, jsonify
from metilda import app
from uuid import uuid4
from datetime import datetime
from sklearn.cluster import KMeans
import numpy as np
from flask import jsonify, request

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from Postgres import Postgres

@app.route('/cms/grades/assignment/submissions', methods=["POST"])
def assignment_submissions():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select id,user_id,time,grade,max_grade from assignment_submissions where assignment=%s'
        args = (request.form['assignment'],)
        result = connection.execute_select_query(query, args)
        if not result:
            return jsonify({})
        return jsonify(list(map(lambda arr:{
            'submission':arr[0],
            'user':arr[1],
            'time':arr[2],
            'grade':arr[3],
            'max_grade':arr[4]
        },result)))

@app.route('/cms/grades/assignment/submission/read', methods=["POST"])
def read_assignment_submission():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select user_id,time,content,grade,max_grade,comment from assignment_submissions where id=%s'
        args = (request.form['submission'],)
        result = connection.execute_select_query(query, args)[0]
        res={
            'user':result[0],
            'time':result[1],
            'content':result[2],
            'grade':result[3],
            'max_grade':result[4],
            'comment':result[5]
        }

    return jsonify(res)

@app.route('/cms/grades/assignment/submission/grade', methods=["POST"])
def grade_assignment_submission():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'update assignment_submissions set grade=%s,comment=%s where id=%s'
        args = (request.form['grade'],request.form['comment'],request.form['submission'],)
        connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/grades/assignment/submission/next', methods=["POST"])
def next_assignment_submission():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select id,time from assignment_submissions where assignment=%s'
        args = (request.form['assignment'],)
        result = connection.execute_select_query(query, args)
        if not result:
            return jsonify({})
        result.sort(key=lambda x:datetime.strptime(x[1][5:-4],'%d %b %Y %H:%M:%S'),reverse=True)
        cur_index=0
        for i in range(len(result)):
            if result[i][0]==request.form['submission']:
                cur_index=i
                break
        if cur_index==len(result)-1:
            return jsonify({})
        res={
            'submission':result[cur_index+1][0],
        }

    return jsonify(res)


#---------------------------------------------------------------------------------------------------------

@app.route('/cms/grades/gradables', methods=["POST"])
def gradable():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select id,name,created_at from gradables where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
        if not result:
            return jsonify({})
        return jsonify(list(map(lambda arr:{
            'id':arr[0],
            'name':arr[1],
            'created_at':arr[2]
        },result)))

@app.route('/cms/grades/gradable/create', methods=["POST"])
def create_gradable():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        id=str(uuid4())
        query = 'insert into gradables(id,name,max_grade,created_at,course,weight) values(%s,%s,%s,%s,%s,%s)'
        args = (id,request.form['name'],float(request.form['max_grade']),request.form['created_at'],request.form['course'],request.form['weight'])
        connection.execute_insert_query(query, args, False)

        query = 'select user_id from users where user_id in (select student_id from student_course where course_id=%s)'
        args = (request.form['course'],)
        students = connection.execute_select_query(query, args)

        for student in students:
            query = 'insert into gradable_grades(gradable_id,user_id,grade) values(%s,%s,%s)'
            args = (id,student[0],-1.0)
            connection.execute_insert_query(query, args, False)

    return jsonify({})

@app.route('/cms/grades/gradable/read', methods=["POST"])
def read_gradable():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select name,max_grade,weight from gradables where id=%s'
        args = (request.form['gradable'],)
        result = connection.execute_select_query(query, args)[0]
        res={
            'name':result[0],
            'max_grade':result[1],
            'weight':result[2],
        }

        query = 'select user_id,grade from gradable_grades where gradable_id=%s'
        args = (request.form['gradable'],)
        result = connection.execute_select_query(query, args)
        res['grades']=list(map(lambda arr:{
            'student':arr[0],
            'grade':arr[1]
        },result))

    return jsonify(res)

@app.route('/cms/grades/gradable/update', methods=["POST"])
def update_gradable():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'update gradables set name=%s,max_grade=%s,weight=%s where id=%s'
        args = (request.form['name'],request.form['max_grade'],request.form['weight'],request.form['gradable'])
        result = connection.execute_update_query(query, args)[0]

    return jsonify({})


@app.route('/cms/grades/gradable/student/read', methods=["POST"])
def read_gradable_student():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select grade from gradable_grades where gradable_id=%s and user_id=%s'
        args = (request.form['gradable'],request.form['student'])
        result = connection.execute_select_query(query, args)[0]
        res={
            'grade':result[0]
        }

    return jsonify(res)

@app.route('/cms/grades/gradable/student/grade', methods=["POST"])
def grade_gradable():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'update gradable_grades set grade=%s where gradable_id=%s and user_id=%s'
        args = (request.form['grade'],request.form['gradable'],request.form['student'],)
        connection.execute_update_query(query, args)

    return jsonify({})

@app.route('/cms/grades/gradable/student/next', methods=["POST"])
def next_gradable_student():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select user_id from users where user_id in (select student_id from student_course where course_id=%s)'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
        if not result:
            return jsonify({})
        result.sort()
        cur_index=0
        for i in range(len(result)):
            if result[i][0]==request.form['student']:
                cur_index=i
                break
        if cur_index==len(result)-1:
            return jsonify({})
        res={
            'student':result[cur_index+1][0],
        }

    return jsonify(res)



# --------------------------------------------------------
@app.route('/cms/grades/quiz', methods=["POST"])
def grade_quizzes():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select id,name,deadline,weight from quiz where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
        if not result:
            return jsonify({})
        return jsonify(list(map(lambda arr:{
            'quiz':arr[0],
            'name':arr[1],
            'deadline':arr[2],
            'weight':arr[3]
        },result)))
    

@app.route('/cms/grades/quiz/read', methods=["POST"])
def grade_read_quiz():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select name,max_grade,weight from quiz where id=%s'
        args = (request.form['quiz'],)
        result = connection.execute_select_query(query, args)[0]
        res={
            'name':result[0],
            'max_grade':result[1],
            'weight':result[2]
        }

        query = 'select student,sum(grade) from (select * from quiz_answers where quiz=%s) as tb1 group by student'
        args = (request.form['quiz'],)
        result = connection.execute_select_query(query, args)
        res['grades']=list(map(lambda arr:{
            'student':arr[0],
            'grade':arr[1]
        },result))

        query = 'select id,idx,type from quiz_questions where quiz=%s'
        args = (request.form['quiz'],)
        result = connection.execute_select_query(query, args)
        if result:
            result.sort(key=lambda x:x[1])
        res['questions']=list(map(lambda arr:{
            'question':arr[0],
            'type':arr[2]
        },result))

    return jsonify(res)

@app.route('/cms/grades/quiz/question/read', methods=["POST"])
def grade_read_quiz_question():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        # query = 'select student,sum(grade) from (select * from quiz_answers where quiz=%s) as tb1 group by student'
        # args = (request.form['quiz'],)
        # result = connection.execute_select_query(query, args)
        # res['grades']=list(map(lambda arr:{
        #     'student':arr[0],
        #     'grade':arr[1]
        # },result))

        query = 'select student,answer,grade,max_grade,time from quiz_answers where question=%s and answer=%s'
        args = (request.form['question'],'speech')
        result = connection.execute_select_query(query, args)
        res={}
        res['submissions']=list(map(lambda arr:{
            'student':arr[0],
            'answer':arr[1],
            'grade':arr[2],
            'max_grade':arr[3],
            'time':arr[4]
        },result))

    return jsonify(res)


@app.route('/cms/grades/quiz/question/answer/read', methods=["POST"])
def grade_read_quiz_question_answer():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select student,answer,grade,max_grade from quiz_answers where question=%s and student=%s'
        args = (request.form['question'],request.form['student'])
        result = connection.execute_select_query(query, args)[0]
        res={            
            'student':result[0],
            'answer':result[1],
            'grade':result[2],
            'max_grade':result[3]
        }

    return jsonify(res)

@app.route('/cms/grades/quiz/question/answer/grade', methods=["POST"])
def grade_quiz_question_answer():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'update quiz_answers set grade=%s where quiz=%s and question=%s and student=%s'
        args = (request.form['grade'],request.form['quiz'],request.form['question'],request.form['student'],)
        connection.execute_update_query(query, args)

    return jsonify({})


@app.route('/cms/grades/quiz/question/answer/next', methods=["POST"])
def next_quiz_answer():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
        
        query = 'select student,time from quiz_answers where question=%s'
        args = (request.form['question'],)
        result = connection.execute_select_query(query, args)
        if not result:
            return jsonify({})
        result.sort(key=lambda x:datetime.strptime(x[1][5:-4],'%d %b %Y %H:%M:%S'),reverse=True)
        cur_index=0
        for i in range(len(result)):
            if result[i][0]==request.form['student']:
                cur_index=i
                break
        if cur_index==len(result)-1:
            return jsonify({})
        res={
            'student':result[cur_index+1][0],
        }

    return jsonify(res)


@app.route('/cms/other_clusters', methods=["POST"])
def get_other_clusters():
    # Get course input
    course_id = request.form['course']

    with Postgres() as connection:
        # Fetch other items for the course
        query = '''
            SELECT g.id, g.name, g.created_at, g.max_grade, g.weight
            FROM gradables g
            WHERE g.course = %s 
            AND g.name NOT IN (
                SELECT name FROM quiz WHERE course = %s
                UNION
                SELECT name FROM assignments WHERE course = %s
            )
        '''
        args = (course_id, course_id, course_id)
        others = connection.execute_select_query(query, args)

        if not others:
            return jsonify({"error": "No other items found for this course"}), 404

        # Extract IDs and names
        other_map = {other[0]: other[1] for other in others}  # Map of {id: name}
        other_ids = tuple(other_map.keys())

        if not other_ids:
            return jsonify({"error": "No valid other items IDs found"}), 404

        # Fetch grades for other items
        grades_query = '''
            SELECT gradable_id, grade, user_id
            FROM gradable_grades 
            WHERE gradable_id IN %s
        '''
        grades = connection.execute_select_query(grades_query, (other_ids,))

        if not grades:
            return jsonify({"error": "No grades found for other items"}), 404

        # Organize grades by item ID
        other_scores = {}
        for gradable_id, grade, user_id in grades:
            if grade != -1:  # Ignore invalid grades
                if gradable_id not in other_scores:
                    other_scores[gradable_id] = []
                other_scores[gradable_id].append((grade, user_id))

        result = []
        for other_id, scores_with_users in other_scores.items():
            if scores_with_users:
                # Prepare data for KMeans
                scores = [score for score, _ in scores_with_users]
                scores_array = np.array(scores).reshape(-1, 1)

                # Apply KMeans clustering
                kmeans = KMeans(n_clusters=min(3, len(scores)), random_state=42)
                kmeans.fit(scores_array)

                # Collect cluster data
                cluster_data = [
                    {'score': score, 'user_id': user_id, 'cluster': int(label)}
                    for (score, user_id), label in zip(scores_with_users, kmeans.labels_)
                ]

                centroids = kmeans.cluster_centers_.flatten().tolist()

                result.append({
                    'name': other_map[other_id],
                    'id': other_id,
                    'cluster_data': cluster_data,
                    'cluster_centroids': centroids
                })

    return jsonify(result)
