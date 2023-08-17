from flask import request, jsonify
from .Postgres import Postgres
from metilda import app
from uuid import uuid4

# --------------------------- Course ---------------------------
@app.route('/cms/courses/create', methods=["POST"])
def create_course():
    with Postgres() as connection:
        query = 'insert into courses(id,name,language,credits,available,schedule) values(%s,%s,%s,%s,%s,%s)'
        args = (int(request.form['id']),request.form['name'],request.form['language'],int(request.form['credits']),bool(request.form['available']),request.form['schedule'])
        connection.execute_insert_query(query, args, False)

        query = 'insert into teacher_course(teacher_id,course_id) values(%s,%s)'
        args = (request.form['user'],int(request.form['id']))
        connection.execute_insert_query(query, args, False)

    return jsonify({})

@app.route('/cms/courses', methods=["POST"])
def read_courses():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select id,name from courses where id in (select course_id from teacher_course where teacher_id=%s)'
        args = (request.form['user'],)
        result = connection.execute_select_query(query, args)
    return jsonify(result)

@app.route('/cms/courses/read', methods=["POST"])
def read_course():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select name,language,credits,available,schedule from courses where id=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)[0]
    return jsonify({
                    'name':result[0],
                    'language':result[1],
                    'credits':result[2],
                    'available':result[3],
                    'schedule':result[4],
                    })

@app.route('/cms/courses/update', methods=["POST"])
def update_course():
    query = 'select user_role from user_role where user_id=%s and verified=true'
    args = (request.form['user'],)
    if not connection.execute_select_query(query, args):
        return jsonify({}),403

    with Postgres() as connection:
        query = 'update courses set name=%s,language=%s,credits=%s,available=%s,schedule=%s where id=%s'
        args = (request.form['name'],request.form['language'],request.form['credits'],request.form['available'],request.form['schedule'],request.form['id'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/courses/delete', methods=["POST"])
def delete_course():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from courses where id=%s'
        args=(request.form['id'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/courses/student-list', methods=["POST"])
def get_student_list():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select user_id,user_name from users where user_id in (select student_id from student_course where course_id=%s)'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
    return jsonify(result)

# -------------------Lesson----------------------------------
@app.route('/cms/lessons/create', methods=["POST"])
def create_lesson():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403
    
        query = 'insert into lessons(id,name,course) values(%s,%s,%s)'
        args = (str(uuid4()),request.form['name'],int(request.form['course']))
        connection.execute_insert_query(query, args, False)

    return jsonify({})

@app.route('/cms/lessons', methods=["POST"])
def read_lessons():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select id,name from lessons where course=%s'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
    return jsonify(result)

@app.route('/cms/lessons/read', methods=["POST"])
def read_lesson():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select name,course from lessons where id=%s'
        args = (request.form['lessonId'],)
        result = connection.execute_select_query(query, args)[0]
    return jsonify({
                    'name':result[0],
                    'course':result[1]
                    })

@app.route('/cms/lessons/update', methods=["POST"])
def update_lesson():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update lessons set name=%s where id=%s'
        args = (request.form['name'],request.form['lessonId'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/lessons/delete', methods=["POST"])
def delete_lesson():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from lessons where id=%s'
        args=(request.form['id'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})

# ---------------------Discussion----------------------------
# ---------------------Topics---------------------------
@app.route('/cms/topics/create', methods=["POST"])
def create_topic():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'insert into topics(id,name,course,description,available,created_at,updated_at) values(%s,%s,%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['name'],int(request.form['course']),request.form['description'],
                bool(request.form['available']),request.form['created_at'],request.form['created_at'])
        connection.execute_insert_query(query, args, False)

    return jsonify({})

@app.route('/cms/topics', methods=["POST"])
def read_topics():
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

@app.route('/cms/topics/read', methods=["POST"])
def read_topic():
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

@app.route('/cms/topics/update', methods=["POST"])
def update_topic():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update topics set name=%s,description=%s,available=%s,updated_at=%s where id=%s'
        args = (request.form['name'],request.form['description'],request.form['available'],
                request.form['updated_at'], request.form['topic'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/topics/delete', methods=["POST"])
def delete_topic():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from topics where id=%s'
        args=(request.form['topic'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})


# ---------------------POSTS---------------------------------
@app.route('/cms/posts/create', methods=["POST"])
def create_post():
    with Postgres() as connection:
        query = 'insert into posts(id,title,content,topic,author,created_at,updated_at) values(%s,%s,%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['title'],request.form['content'],request.form['topic'],
                request.form['author'],request.form['created_at'],request.form['created_at'])
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/cms/posts', methods=["POST"])
def read_posts():
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

@app.route('/cms/posts/read', methods=["POST"])
def read_post():
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

@app.route('/cms/posts/update', methods=["POST"])
def update_post():
    with Postgres() as connection:
        query = 'update posts set title=%s,content=%s,updated_at=%s where id=%s'
        args = (request.form['title'],request.form['content'],request.form['updated_at'],request.form['post'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/posts/delete', methods=["POST"])
def delete_post():
    with Postgres() as connection:
        query = 'delete from posts where id=%s'
        args=(request.form['post'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})



# -----------------------Reply------------------------------
@app.route('/cms/replies/create', methods=["POST"])
def create_reply():
    with Postgres() as connection:    
        query = 'insert into replies(id,content,post,author,created_at) values(%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['content'],request.form['post'],request.form['author'],request.form['created_at'])
        connection.execute_insert_query(query, args, False)

        query = 'update posts set updated_at=%s where id=%s'
        args = (request.form['created_at'],request.form['post'])
        connection.execute_insert_query(query, args, False)
    return jsonify({})

@app.route('/cms/replies', methods=["POST"])
def read_replies():
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

@app.route('/cms/replies/read', methods=["POST"])
def read_reply():
    with Postgres() as connection:
        query = 'select content,author,created_at from replies where id=%s'
        args = (request.form['reply'],)
        result = connection.execute_select_query(query, args)[0]
    return jsonify({
                    'content':result[0],
                    'author':result[1]
                    })

@app.route('/cms/replies/update', methods=["POST"])
def update_reply():
    with Postgres() as connection:
        query = 'update replies set content=%s where id=%s'
        args = (request.form['content'],request.form['reply'])
        result = connection.execute_update_query(query, args)
    return jsonify({})

@app.route('/cms/replies/delete', methods=["POST"])
def delete_reply():
    with Postgres() as connection:
        query = 'delete from replies where id=%s'
        args=(request.form['reply'],)
        result = connection.execute_update_query(query, args)
    return jsonify({})




# --------------------------TESTS----------------------------

@app.route('/test/create', methods=["POST"])
def backend_test():
    with Postgres() as connection:
        query = 'insert into courses(name,language,credits,available,schedule) values(%s,%s,%s,%s,%s)'
        args = ('test_name','test_lan','5','1','test_sche')
        connection.execute_insert_query(query,args,False)

    return jsonify({})

@app.route('/test/create-rel', methods=["POST"])
def relation_creation():
    with Postgres() as connection:
        query = 'insert into teacher_course values(%s,%s)'
        args = ('1','1')
        connection.execute_insert_query(query,args,False)

    return jsonify({})