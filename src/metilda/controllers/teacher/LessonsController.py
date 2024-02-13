from flask import request, jsonify
from metilda import app
from uuid import uuid4
import json

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from Postgres import Postgres


# ----------------Lessons--------------------
@app.route('/cms/lessons/create', methods=["POST"])
def create_lesson():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
    
        query = 'insert into lessons(id,name,course,idx,available) values(%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['name'],int(request.form['course']),int(request.form['length']),bool(request.form['available']))
        connection.execute_insert_query(query, args, False)

    return jsonify({})

@app.route('/cms/lessons', methods=["POST"])
def read_lessons():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select id,name,idx,available from lessons where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
        result.sort(key=lambda x:x[2])
    return jsonify(result)

@app.route('/cms/lessons/read', methods=["POST"])
def read_lesson():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select name,available from lessons where id=%s'
        args = (request.form['lesson'],)
        result = connection.execute_select_query(query, args)

        query = 'select id,idx,type,content from lesson_blocks where lesson=%s'
        args = (request.form['lesson'],)
        result2 = connection.execute_select_query(query, args)
        result2.sort(key=lambda x:x[1])
        result.append(result2)

    return jsonify({
        'name':result[0][0],
        'available':result[0][1],
        'content':list(map(lambda arr:{
            'id':arr[0],
            'idx':arr[1],
            'type':arr[2],
            'content':arr[3]
        },result[1]))
    })

@app.route('/cms/lessons/update', methods=["POST"])
def update_lesson():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update lessons set name=%s,available=%s where id=%s'
        args = (request.form['name'],request.form['available'],request.form['lesson'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/lessons/reorganize', methods=["POST"])
def reorganize_lessons():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        lesson_list=request.form['lessons'].split(';')
        for lesson in lesson_list:
            data=lesson.split(',')
            query = 'update lessons set idx=%s where id=%s'
            args = (data[1],data[0])
            connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/lessons/delete', methods=["POST"])
def delete_lesson():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from lessons where id=%s'
        args=(request.form['lesson'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})

# ----------------Lesson block--------------------
@app.route('/cms/lesson/blocks/create', methods=["POST"])
def create_block():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
    
        block_id=str(uuid4())
        query = 'insert into lesson_blocks(id,lesson,idx,type,content) values(%s,%s,%s,%s,%s)'
        args = (block_id,request.form['lesson'],int(request.form['index']),request.form['type'],request.form['content'])
        connection.execute_insert_query(query, args, False)

    return jsonify({'id':block_id})

# @app.route('/cms/lesson/blocks', methods=["POST"])
# def read_blocks():
#     with Postgres() as connection:
#         query = 'select user_role from user_role where user_id=%s and verified=true'
#         args = (request.form['user'],)
#         if not connection.execute_select_query(query, args):
#             return jsonify({}),403

#         query = 'select id,idx,type,content from lesson_blocks where lesson=%s'
#         args = (request.form['lesson'],)
#         result = connection.execute_select_query(query, args)
#         result.sort(key=lambda x:x[1])
#     return jsonify(result)

# @app.route('/cms/lesson/blocks/read', methods=["POST"])
# def read_block():
#     with Postgres() as connection:
#         query = 'select user_role from user_role where user_id=%s and verified=true'
#         args = (request.form['user'],)
#         if not connection.execute_select_query(query, args):
#             return jsonify({}),403

#         query = 'select type,content from lesson_blocks where id=%s'
#         args = (request.form['block'],)
#         result = connection.execute_select_query(query, args)[0]
#     return jsonify({
#         'type':result[0],
#         'content':result[1]
#     })

@app.route('/cms/lesson/blocks/update', methods=["POST"])
def update_block():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update lesson_blocks set content=%s where id=%s'
        args = (request.form['content'],request.form['block'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/lesson/blocks/reorganize', methods=["POST"])
def reorganize_blocks():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        block_list=json.loads(request.form['blocks'])
        for block in block_list:
            query = 'update lesson_blocks set idx=%s where id=%s'
            args = (block['index'],block['id'])
            connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/lesson/blocks/delete', methods=["POST"])
def delete_block():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from lesson_blocks where id=%s'
        args=(request.form['block'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})



@app.route('/cms/lesson/block/file/create', methods=["POST"])
def lesson_block_create_file():
    with Postgres() as connection:
        query = 'insert into lesson_block_files values(%s,%s,%s,%s,%s,%s,%s)'
        args = (request.form['user_id'], request.form['file_name'], request.form['file_path'],request.form['file_type'], 
                request.form['file_size'],request.form['block'],request.form['course'])
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/cms/lesson/block/file/delete', methods=["POST"])
def lesson_block_delete_file():
    with Postgres() as connection:
        if(request.form['old_path']):
            query = 'delete from lesson_block_files where path=%s'
            args=(request.form['old_path'],)
            connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/lesson/block/file/read/<string:course>/<string:type>/<string:block>', methods=["GET"])
def lesson_block_get_file(course,type,block):
    with Postgres() as connection:
        query = 'select * from lesson_block_files where course=%s and type=%s and block=%s'

        args= (course,type,block)

        result = connection.execute_select_query(query, args)[0]
        return jsonify(result)