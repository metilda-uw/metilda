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

        query = 'select * from quiz_answers where question=%s and student=%s'
        args = (request.form['question'],request.form['user'])
        result=connection.execute_select_query(query, args)

        if request.form['answer']=='speech':
            if result:
                query = 'update quiz_answers set time=%s,grade=%s,trial=%s where question=%s and student=%s'
                args = (request.form['time'],0.0,request.form['trial'],request.form['question'],request.form['user'])
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
        