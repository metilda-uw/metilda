from flask import request, jsonify
from metilda import app
from uuid import uuid4

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from Postgres import Postgres

@app.route('/cms/quiz/create', methods=["POST"])
def create_quiz():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
    
        id=str(uuid4())
        query = 'insert into quiz(id,name,course,start,deadline,description,max_grade,weight) values(%s,%s,%s,%s,%s,%s,%s,%s)'
        args = (id,request.form['name'],int(request.form['course']),request.form['start'],
                request.form['deadline'],request.form['description'],request.form['max_grade'],request.form['weight'])
        connection.execute_insert_query(query, args, False)

    return jsonify({'quiz':id})

@app.route('/cms/quiz', methods=["POST"])
def read_quizzes():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

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

@app.route('/cms/quiz/read', methods=["POST"])
def read_quiz():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select name,start,deadline,description,max_grade,weight from quiz where id=%s'
        args = (request.form['quiz'],)
        result = connection.execute_select_query(query, args)[0]
        res={
            'name':result[0],
            'start':result[1],
            'deadline':result[2],
            'description':result[3],
            'max_grade':result[4],
            'weight':result[5]
        }

    return jsonify(res)

@app.route('/cms/quiz/update', methods=["POST"])
def update_quiz():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update quiz set name=%s,start=%s,deadline=%s,description=%s,max_grade=%s,weight=%s where id=%s'
        args = (request.form['name'],request.form['start'],request.form['deadline'],request.form['description'],
                float(request.form['max_grade']),float(request.form['weight']),request.form['quiz'],)
        result = connection.execute_update_query(query, args)

    return jsonify({})

@app.route('/cms/quiz/delete', methods=["POST"])
def delete_quiz():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from quiz where id=%s'
        args=(request.form['quiz'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})



# --------------Quiz question------------------------
@app.route('/cms/quiz/questions/create', methods=["POST"])
def create_quiz_question():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        id=str(uuid4())
        if request.form['type']=='speech':
            query = 'insert into quiz_questions(id,quiz,content,choices,solution,idx,max_grade,type,max_trials) values(%s,%s,%s,%s,%s,%s,%s,%s,%s)'
            args = (id,request.form['quiz'],request.form['content'],request.form['choices'],request.form['solution'],
                request.form['index'],request.form['max_grade'],request.form['type'],request.form['max_trials'])
        else:
            query = 'insert into quiz_questions(id,quiz,content,choices,solution,idx,max_grade,type) values(%s,%s,%s,%s,%s,%s,%s,%s)'
            args = (id,request.form['quiz'],request.form['content'],request.form['choices'],request.form['solution'],
                request.form['index'],request.form['max_grade'],request.form['type'])
        connection.execute_insert_query(query, args, False)

    return jsonify({'question':id})

@app.route('/cms/quiz/questions', methods=["POST"])
def read_quiz_questions():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select id,content,choices,solution,idx,max_grade from quiz_questions where quiz=%s'
        args = (request.form['quiz'],)
        result = connection.execute_select_query(query, args)
        result.sort(key=lambda x:x[4])

    if result:
        return jsonify(list(map(lambda arr:{
            'id':arr[0],
            'content':arr[1],
            'choices':arr[2],
            'solution':arr[3],
            'index':arr[4],
            'max_grade':arr[5]
        },result)))
    else:
        return jsonify([])

@app.route('/cms/quiz/questions/read', methods=["POST"])
def read_quiz_question():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select content,choices,solution,max_grade,type,max_trials from quiz_questions where id=%s'
        args = (request.form['question'],)
        result = connection.execute_select_query(query, args)[0]
        if result[5]:
            if result[5]>0:
                res={
                    'content':result[0],
                    'choices':result[1],
                    'solution':result[2],
                    'max_grade':result[3],
                    'type':result[4],
                    'max_trials':result[5]
                }
        else:
            res={
                'content':result[0],
                'choices':result[1],
                'solution':result[2],
                'max_grade':result[3],
                'type':result[4]
            }

    return jsonify(res)

@app.route('/cms/quiz/questions/update', methods=["POST"])
def update_quiz_question():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        if request.form['solution']=='':
            query = 'update quiz_questions set content=%s,max_grade=%s,max_trials=%s where id=%s'
            args = (request.form['content'],request.form['max_grade'],request.form['max_trials'],request.form['question'])
        else:
            query = 'update quiz_questions set content=%s,choices=%s,solution=%s,max_grade=%s where id=%s'
            args = (request.form['content'],request.form['choices'],request.form['solution'],request.form['max_grade'],request.form['question'])
        result = connection.execute_update_query(query, args)

    return jsonify({})

@app.route('/cms/quiz/questions/delete', methods=["POST"])
def delete_quiz_question():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from quiz_questions where id=%s'
        args=(request.form['question'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})



@app.route('/cms/quiz/questions/reorganize', methods=["POST"])
def reorganize_questions():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        question_list=request.form['questions'].split(';')
        for question in question_list:
            data=question.split(',')
            query = 'update quiz_questions set idx=%s where id=%s'
            args = (data[1],data[0])
            connection.execute_update_query(query, args)
    return jsonify({})


@app.route('/cms/quiz/question/file/create', methods=["POST"])
def quiz_question_create_file():
    with Postgres() as connection:
        query = 'insert into quiz_question_files values(%s,%s,%s,%s,%s,%s,%s)'
        args = (request.form['user_id'], request.form['file_name'], request.form['file_path'],request.form['file_type'], 
                request.form['file_size'],request.form['question'],request.form['course'])
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/cms/quiz/question/file/delete', methods=["POST"])
def quiz_question_delete_file():
    with Postgres() as connection:
        if(request.form['old_path']):
            query = 'delete from quiz_question_files where path=%s'
            args=(request.form['old_path'],)
            connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/quiz/question/file/read/<string:course>/<string:type>/<string:question>', methods=["GET"])
def quiz_question_get_file(course,type,question):
    with Postgres() as connection:
        query = 'select * from quiz_question_files where course=%s and type=%s and question=%s'

        args= (course,type,question)

        result = connection.execute_select_query(query, args)[0]
        return jsonify(result)