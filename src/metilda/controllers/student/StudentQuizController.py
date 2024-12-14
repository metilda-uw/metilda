from flask import request, jsonify
from metilda import app
from uuid import uuid4
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from Postgres import Postgres

@app.route('/student-view/quiz', methods=["POST"])
def student_read_quizzes():
    with Postgres() as connection:
        query = 'select id,name,start,deadline,description,max_grade,weight from quiz where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
    if result:
        return jsonify(list(map(lambda arr:{
            'quiz':arr[0],
            'name':arr[1],
            'start':arr[2],
            'deadline':arr[3],
            'description':arr[4],
            'max_grade':arr[5],
            'weight':arr[6]
        },result)))
    else:
        return jsonify([])


@app.route('/student-view/quiz_grades', methods=["POST"])
def get_quiz_grades():
    # Get the user's course input
    course_id = request.form['course']
    current_user_email = request.form.get("user")  # Email of the logged-in user

    with Postgres() as connection:
        # Fetch quizzes for the course
        quiz_query = '''
            SELECT id, name, deadline, description, max_grade, weight 
            FROM quiz 
            WHERE course = %s
        '''
        quizzes = connection.execute_select_query(quiz_query, (course_id,))

        if not quizzes:
            return jsonify({"error": "No quiz found for this course"}), 404

        # Extract quiz IDs
        quiz_ids = tuple(quiz[0] for quiz in quizzes)

        if not quiz_ids:
            return jsonify({"error": "No valid quiz IDs found"}), 404

        # Fetch grades for these quizzes using IN clause
        grades_query = '''
            SELECT gradable_id, grade, user_id
            FROM gradable_grades 
            WHERE gradable_id IN %s
        '''
        grades = connection.execute_select_query(grades_query, (quiz_ids,))

        if not grades:
            return jsonify({"error": "No grades found for these quizes"}), 404

        # Organize grades by quiz ID
        quiz_scores = {}
        for gradable_id, grade, user_id in grades:
            if grade != -1:  # Ignore invalid grades
                if gradable_id not in quiz_scores:
                    quiz_scores[gradable_id] = []
                quiz_scores[gradable_id].append((grade, user_id))

        # Prepare the result with additional metrics
        result = []
        gradable_ids = {gradable_id for gradable_id, _, _ in grades}
        for quiz in quizzes:
            quiz_id, name, deadline, description, max_grade, weight = quiz
            if quiz_id in gradable_ids:
                scores = [score for score, _ in quiz_scores.get(quiz_id, [])]

                user_grade=0
                
                # Calculate metrics if there are valid scores
                if scores:
                    lowest_score = min(scores)
                    average_score = sum(scores) / len(scores)
                    highest_score = max(scores)

                    # Calculate the current user's percentile if email is provided
                    user_grade = next(
                        (grade for grade, uid in quiz_scores.get(quiz_id, []) if uid == current_user_email),
                        None
                    )

                    if user_grade is not None:
                        sorted_scores = sorted(scores)
                        percentile_rank = (sorted_scores.index(user_grade) / len(sorted_scores)) * 100
                    else:
                        percentile_rank = None
                else:
                    lowest_score = average_score = highest_score = percentile_rank = None

                # Add quiz details to the result
                result.append({
                    'quiz_id': quiz_id,
                    'name': name,
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


@app.route('/student-view/quiz/read', methods=["POST"])
def student_read_quiz():
    with Postgres() as connection:
        query = 'select name,start,deadline,description,max_grade,weight from quiz where id=%s'
        args = (request.form['quiz'],)
        result = connection.execute_select_query(query, args)[0]
        if datetime.strptime(result[1][5:-4],'%d %b %Y %H:%M:%S') > datetime.utcnow():
            return jsonify({})
        
        if datetime.strptime(result[2][5:-4],'%d %b %Y %H:%M:%S') < datetime.utcnow():
            return jsonify({})
        res={
            'name':result[0],
            'start':result[1],
            'deadline':result[2],
            'description':result[3],
            'max_grade':result[4],
            'weight':result[5]
        }

    return jsonify(res)

# --------------Quiz question------------------------
@app.route('/student-view/quiz/questions', methods=["POST"])
def student_read_quiz_questions():
    with Postgres() as connection:
        query = 'select id,content,choices,idx,max_grade from quiz_questions where quiz=%s'
        args = (request.form['quiz'],)
        result = connection.execute_select_query(query, args)
        result.sort(key=lambda x:x[3])

    if result:
        return jsonify(list(map(lambda arr:{
            'id':arr[0],
            'content':arr[1],
            'choices':arr[2],
            'index':arr[3],
            'max_grade':arr[4]
        },result)))
    else:
        return jsonify([])

@app.route('/student-view/quiz/questions/read', methods=["POST"])
def student_read_quiz_question():
    with Postgres() as connection:
        query = 'select content,choices,max_grade,type,max_trials from quiz_questions where id=%s'
        args = (request.form['question'],)
        result = connection.execute_select_query(query, args)[0]
        if result[3]=='speech':
            res={
                'content':result[0],
                'choices':result[1],
                'max_grade':result[2],
                'type':result[3],
                'max_trials':result[4]
            }
        else:
            res={
                'content':result[0],
                'choices':result[1],
                'max_grade':result[2],
                'type':result[3]
            }
        query = 'select answer,trial from quiz_answers where question=%s and student=%s'
        args = (request.form['question'],request.form['user'])
        result = connection.execute_select_query(query, args)
        if result:
            res['prev_answer']=result[0][0]
            if res['type']=='speech':
                res['trial']=result[0][1]
        else:
            res['prev_answer']=''
            if res['type']=='speech':
                res['trial']=0

    return jsonify(res)

@app.route('/student-view/quiz/question/answer', methods=["POST"])
def student_answer_quiz_question():
    with Postgres() as connection:
        query = 'select deadline from quiz where id=%s'
        args = (request.form['quiz'],)
        result = connection.execute_select_query(query, args)[0]
        if datetime.strptime(result[0][5:-4],'%d %b %Y %H:%M:%S') < datetime.utcnow():
            return jsonify({}) 
        
        query = 'select max_trials from quiz_questions where id=%s'
        args = (request.form['question'],)
        max_trials=connection.execute_select_query(query, args)

        query = 'select trial from quiz_answers where question=%s and student=%s'
        args = (request.form['question'],request.form['user'])
        result=connection.execute_select_query(query, args)

        if max_trials and result:
            if max_trials[0][0]<=result[0][0]:
                return jsonify({})

        if request.form['answer']=='speech':
            if result:
                query = 'update quiz_answers set time=%s,grade=%s,trial=%s where question=%s and student=%s'
                args = (request.form['time'],0.0,result[0][0]+1,request.form['question'],request.form['user'])
                connection.execute_update_query(query, args)
            else:
                query = 'insert into quiz_answers(quiz,question,student,answer,time,grade,max_grade,trial) values(%s,%s,%s,%s,%s,%s,%s,%s)'
                args = (request.form['quiz'],request.form['question'],request.form['user'],request.form['answer'],
                    request.form['time'],0.0,request.form['max_grade'],1)
                connection.execute_insert_query(query, args, False)
        else:
            if result:
                query = 'select solution,max_grade from quiz_questions where id=%s'
                args = (request.form['question'],)
                result=connection.execute_select_query(query, args)[0]
                
                
                query = 'update quiz_answers set answer=%s,time=%s,grade=%s where question=%s and student=%s'
                if result[0]==request.form['answer']:
                    args = (request.form['answer'],request.form['time'],result[1],request.form['question'],request.form['user'])
                else:
                    args = (request.form['answer'],request.form['time'],0.0,request.form['question'],request.form['user'])
                connection.execute_update_query(query, args)
            else:
                query = 'select solution,max_grade from quiz_questions where id=%s'
                args = (request.form['question'],)
                result=connection.execute_select_query(query, args)[0]

                query = 'insert into quiz_answers(quiz,question,student,answer,time,grade,max_grade) values(%s,%s,%s,%s,%s,%s,%s)'
                if result[0]==request.form['answer']:
                    args = (request.form['quiz'],request.form['question'],request.form['user'],
                        request.form['answer'],request.form['time'],result[1],request.form['max_grade'])
                else:
                    args = (request.form['quiz'],request.form['question'],request.form['user'],
                        request.form['answer'],request.form['time'],0.0,request.form['max_grade'])
                connection.execute_insert_query(query, args, False)

    return jsonify({})


@app.route('/student-view/quiz/question/next', methods=["POST"])
def student_next_question():
    with Postgres() as connection:
        query = 'select id,idx from quiz_questions where quiz=%s'
        args = (request.form['quiz'],)
        result = connection.execute_select_query(query, args)
        if not result:
            return jsonify({})
        result.sort(key=lambda x:x[1])
        cur_index=0
        for i in range(len(result)):
            if result[i][0]==request.form['question']:
                cur_index=i
                break
        if cur_index==len(result)-1:
            return jsonify({})
        
        res={
            'question':result[cur_index+1][0],
        }

    return jsonify(res)



@app.route('/student-view/quiz/question/answer/file/create', methods=["POST"])
def student_quiz_question_answer_create_file():
    with Postgres() as connection:
        query = 'insert into quiz_answer_files values(%s,%s,%s,%s,%s,%s,%s)'
        args = (request.form['user_id'], request.form['file_name'], request.form['file_path'],request.form['file_type'], 
                request.form['file_size'],request.form['question'],request.form['course'])
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/student-view/quiz/question/answer/file/delete', methods=["POST"])
def student_quiz_question_answer_delete_file():
    with Postgres() as connection:
        if(request.form['old_path']):
            query = 'delete from quiz_answer_files where path=%s'
            args=(request.form['old_path'],)
            connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/student-view/quiz/question/answer/file/read/<string:course>/<string:type>/<string:question>/<string:user>', methods=["GET"])
def student_quiz_question_answer_get_file(course,type,question,user):
    with Postgres() as connection:
        query = 'select * from quiz_answer_files where course=%s and type=%s and question=%s and user_id=%s'

        args= (course,type,question,user)
        result = connection.execute_select_query(query, args)
        if(result):
            result=result[0]
            return jsonify(result)
        else:
            return jsonify({})
        