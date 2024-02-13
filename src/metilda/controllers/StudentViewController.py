from flask import request, jsonify
from .Postgres import Postgres
from metilda import app
from uuid import uuid4

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



# ---------------------Topics---------------------------
@app.route('/student-view/topics/create', methods=["POST"])
def student_create_topic():
    with Postgres() as connection:
        query = 'insert into topics(id,name,course,description,available,created_at,updated_at) values(%s,%s,%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['name'],int(request.form['course']),request.form['description'],
                bool(request.form['available']),request.form['created_at'],request.form['created_at'])
        connection.execute_insert_query(query, args, False)

    return jsonify({})

@app.route('/student-view/topics', methods=["POST"])
def student_read_topics():
    with Postgres() as connection:
        query = 'select id,name,description,available,created_at from topics where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
    return jsonify(list(map(lambda arr:{
        'topic':arr[0],
        'name':arr[1],
        'description':arr[2],
        'available':arr[3],
        'created_at':arr[4],
    },result)))

@app.route('/student-view/topics/read', methods=["POST"])
def student_read_topic():
    with Postgres() as connection:
        query = 'select name,description,available,created_at from topics where id=%s'
        args = (request.form['topic'],)
        result = connection.execute_select_query(query, args)[0]
        topic={
            'name':result[0],
            'description':result[1],
            'available':result[2]
        }

    return jsonify(topic)

@app.route('/student-view/topics/update', methods=["POST"])
def student_update_topic():
    with Postgres() as connection:
        query = 'update topics set name=%s,description=%s,available=%s,updated_at=%s where id=%s'
        args = (request.form['name'],request.form['description'],request.form['available'],
                request.form['updated_at'], request.form['topic'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/student-view/topics/delete', methods=["POST"])
def student_delete_topic():
    with Postgres() as connection:
        query = 'delete from topics where id=%s'
        args=(request.form['topic'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})


# ---------------------POSTS---------------------------------
@app.route('/student-view/posts/create', methods=["POST"])
def student_create_post():
    with Postgres() as connection:
        query = 'insert into posts(id,title,content,topic,author,created_at,updated_at) values(%s,%s,%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['title'],request.form['content'],request.form['topic'],
                request.form['author'],request.form['created_at'],request.form['created_at'])
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/student-view/posts', methods=["POST"])
def student_read_posts():
    with Postgres() as connection:
        query = 'select id,title,content,author,created_at,updated_at from posts where topic=%s'
        args = (request.form['topic'],)
        result = connection.execute_select_query(query, args)
    return jsonify(list(map(lambda arr:{
        'post':arr[0],
        'title':arr[1],
        'content':arr[2],
        'author':arr[3],
        'created_at':arr[4],
        'updated_at':arr[5],
    },result)))

@app.route('/student-view/posts/read', methods=["POST"])
def student_read_post():
    with Postgres() as connection:
        query = 'select title,content,author,created_at,updated_at from posts where id=%s'
        args = (request.form['post'],)
        result = connection.execute_select_query(query, args)[0]
    return jsonify({
                    'title':result[0],
                    'content':result[1],
                    'author':result[2],
                    'created_at':result[3],
                    'updated_at':result[4]
                    })

@app.route('/student-view/posts/update', methods=["POST"])
def student_update_post():
    with Postgres() as connection:
        query = 'update posts set title=%s,content=%s,updated_at=%s where id=%s'
        args = (request.form['title'],request.form['content'],request.form['updated_at'],request.form['post'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/student-view/posts/delete', methods=["POST"])
def student_delete_post():
    with Postgres() as connection:
        query = 'delete from posts where id=%s'
        args=(request.form['post'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})



# -----------------------Reply------------------------------
@app.route('/student-view/replies/create', methods=["POST"])
def student_create_reply():
    with Postgres() as connection:
        query = 'insert into replies(id,content,post,author,created_at) values(%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['content'],request.form['post'],request.form['author'],request.form['created_at'])
        connection.execute_insert_query(query, args, False)

        query = 'update posts set updated_at=%s where id=%s'
        args = (request.form['created_at'],request.form['post'])
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/student-view/replies', methods=["POST"])
def student_read_replies():
    with Postgres() as connection:
        query = 'select id,content,author,created_at from replies where post=%s'
        args = (request.form['post'],)
        result = connection.execute_select_query(query, args)
    return jsonify(list(map(lambda arr:{
        'reply':arr[0],
        'content':arr[1],
        'author':arr[2],
        'created_at':arr[3]
    },result)))

@app.route('/student-view/replies/read', methods=["POST"])
def student_read_reply():
    with Postgres() as connection:

        query = 'select content,author,created_at from replies where id=%s'
        args = (request.form['reply'],)
        result = connection.execute_select_query(query, args)[0]
    return jsonify({
                    'content':result[0],
                    'author':result[1]
                    })

@app.route('/student-view/replies/update', methods=["POST"])
def student_update_reply():
    with Postgres() as connection:
        query = 'update replies set content=%s where id=%s'
        args = (request.form['content'],request.form['reply'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/student-view/replies/delete', methods=["POST"])
def student_delete_reply():
    with Postgres() as connection:
        query = 'delete from replies where id=%s'
        args=(request.form['reply'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})


