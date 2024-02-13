from flask import request, jsonify
from metilda import app
import json

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from Postgres import Postgres


# ----------------Lessons--------------------
@app.route('/student-view/lessons', methods=["POST"])
def student_read_lessons():
    with Postgres() as connection:
        query = 'select id,name,idx,available from lessons where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
        result.sort(key=lambda x:x[2])
    return jsonify(result)

@app.route('/student-view/lessons/read', methods=["POST"])
def student_read_lesson():
    with Postgres() as connection:
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


# ----------------Lesson block--------------------
@app.route('/student-view/lesson/block/file/read/<string:course>/<string:type>/<string:block>', methods=["GET"])
def student_lesson_block_get_file(course,type,block):
    with Postgres() as connection:
        query = 'select * from lesson_block_files where course=%s and type=%s and block=%s'

        args= (course,type,block)

        result = connection.execute_select_query(query, args)[0]
        return jsonify(result)