from flask import request, jsonify
from .Postgres import Postgres
from metilda import app
from metilda.cache import cache
from uuid import uuid4
from datetime import datetime

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import json

def clear_cache(*prefixes):
    keys_to_delete = [key for key in cache.cache._cache if any(prefix in key for prefix in prefixes)]
    for key in keys_to_delete:
        cache.delete(key)

@app.route('/cms/courses/create', methods=["POST"])
def create_course():
    with Postgres() as connection:
        query = 'insert into courses(id,name,language,credits,available,schedule) values(%s,%s,%s,%s,%s,%s)'
        args = (int(request.form['id']),request.form['name'],request.form['language'],int(request.form['credits']),bool(request.form['available']),request.form['schedule'])
        connection.execute_insert_query(query, args, False)

        query = 'insert into teacher_course(teacher_id,course_id) values(%s,%s)'
        args = (request.form['user'],int(request.form['id']))
        connection.execute_insert_query(query, args, False)
        clear_cache("course")

    return jsonify({})


@app.route('/cms/courses', methods=["POST"])
@cache.memoize(500)
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
@cache.memoize(500)
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
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update courses set name=%s,language=%s,credits=%s,available=%s,schedule=%s where id=%s'
        args = (request.form['name'],request.form['language'],request.form['credits'],request.form['available'],request.form['schedule'],request.form['id'])
        result = connection.execute_update_query(query, args)
        clear_cache("course")
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
        clear_cache("course")
    return jsonify({})

@app.route('/cms/courses/student-list', methods=["POST"])
@cache.memoize(500)
def course_get_student_list():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select user_id,user_name from users where user_id in (select student_id from student_course where course_id=%s)'
        args = (request.form['course'],)
        result = connection.execute_select_query(query, args)
    return jsonify(result)


@app.route('/cms/topics/create', methods=["POST"])
def discussion_create_topic():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'insert into topics(id,name,course,description,available,created_at,updated_at) values(%s,%s,%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['name'],int(request.form['course']),request.form['description'],
                bool(request.form['available']),request.form['created_at'],request.form['created_at'])
        connection.execute_insert_query(query, args, False)
        clear_cache("discussion")
    return jsonify({})

import time

@app.route('/cms/topics', methods=["POST"])
@cache.memoize(500)
def discussion_read_topics():
    with Postgres() as connection:
        query = '''
            SELECT id, name, description, available, created_at
            FROM topics
            WHERE course = %s 
            AND EXISTS (SELECT 1 FROM user_role WHERE user_id = %s AND verified = true)
        '''
        args = (request.form['course'], request.form['user'])
        result = connection.execute_select_query(query, args)
    return jsonify([{
        'topic': arr[0],
        'name': arr[1],
        'description': arr[2],
        'available': arr[3],
        'created_at': arr[4],
    } for arr in result])

@app.route('/cms/topics/read', methods=["POST"])
@cache.memoize(500)
def discussion_read_topic():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

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
def discussion_update_topic():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update topics set name=%s,description=%s,available=%s,updated_at=%s where id=%s'
        args = (request.form['name'],request.form['description'],request.form['available'],
                request.form['updated_at'], request.form['topic'])
        result = connection.execute_update_query(query, args)
        clear_cache("discussion")
    return jsonify({})

@app.route('/cms/topics/delete', methods=["POST"])
def discussion_delete_topic():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from topics where id=%s'
        args=(request.form['topic'],)
        result = connection.execute_update_query(query, args)
        clear_cache("discussion")
    return jsonify({})


# ---------------------POSTS---------------------------------
@app.route('/cms/posts/create', methods=["POST"])
def discussion_create_post():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'insert into posts(id,title,content,topic,author,created_at,updated_at) values(%s,%s,%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['title'],request.form['content'],request.form['topic'],
                request.form['author'],request.form['created_at'],request.form['created_at'])
        connection.execute_insert_query(query, args, False)
        clear_cache("discussion")
    return jsonify({})

@app.route('/cms/posts', methods=["POST"])
@cache.memoize(500)
def discussion_read_posts():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

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
@cache.memoize(500)
def discussion_read_post():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

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
def discussion_update_post():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update posts set title=%s,content=%s,updated_at=%s where id=%s'
        args = (request.form['title'],request.form['content'],request.form['updated_at'],request.form['post'])
        result = connection.execute_update_query(query, args)
        clear_cache("discussion")
    return jsonify({})

@app.route('/cms/posts/delete', methods=["POST"])
def discussion_delete_post():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from posts where id=%s'
        args=(request.form['post'],)
        result = connection.execute_update_query(query, args)
        clear_cache("discussion")
    return jsonify({})


@app.route('/cms/replies/create', methods=["POST"])
def discussion_create_reply():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'insert into replies(id,content,post,author,created_at) values(%s,%s,%s,%s,%s)'
        args = (str(uuid4()),request.form['content'],request.form['post'],request.form['author'],request.form['created_at'])
        connection.execute_insert_query(query, args, False)

        query = 'update posts set updated_at=%s where id=%s'
        args = (request.form['created_at'],request.form['post'])
        connection.execute_insert_query(query, args, False)

        clear_cache("discussion")

    return jsonify({})

@app.route('/cms/replies', methods=["POST"])
@cache.memoize(500)
def discussion_read_replies():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

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
@cache.memoize(500)
def discussion_read_reply():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'select content,author,created_at from replies where id=%s'
        args = (request.form['reply'],)
        result = connection.execute_select_query(query, args)[0]
    return jsonify({
                    'content':result[0],
                    'author':result[1]
                    })

@app.route('/cms/replies/update', methods=["POST"])
def discussion_update_reply():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'update replies set content=%s where id=%s'
        args = (request.form['content'],request.form['reply'])
        result = connection.execute_update_query(query, args)
        clear_cache("discussion")
    return jsonify({})

@app.route('/cms/replies/delete', methods=["POST"])
def discussion_delete_reply():
    with Postgres() as connection:
        query = 'select user_role from user_role where user_id=%s and verified=true'
        args = (request.form['user'],)
        if not connection.execute_select_query(query, args):
            return jsonify({}),403

        query = 'delete from replies where id=%s'
        args=(request.form['reply'],)
        result = connection.execute_update_query(query, args)
        clear_cache("discussion")
    return jsonify({})


@app.route('/cms/announcements/create', methods=["POST"])
def create_announcement():
    with Postgres() as connection:
        # Generate a unique ID for the announcement
        announcement_id = str(uuid4())

        # Ensure created_at has a default value
        created_at = request.form.get('created_at', datetime.utcnow().isoformat())

        # Insert announcement into the database
        query = '''
        INSERT INTO announcements (id, teacher_mail_id, course_id, title, message, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        '''
        args = (
            announcement_id,
            request.form['user'],
            int(request.form['course_id']),
            request.form['title'],
            request.form['content'],
            created_at
        )
        connection.execute_insert_query(query, args, False)

        # Fetch all students in the course
        query = 'SELECT student_id FROM student_course WHERE course_id=%s'
        args = (int(request.form['course_id']),)  # Fixed tuple formatting
        students = connection.execute_select_query(query, args)

        # Ensure students is not None before looping
        if not students:
            return jsonify({"error": "No students found for this course"}), 400

        # Insert into announcement_recipients table
        for student in students:
            query = '''
            INSERT INTO announcement_recipients (id, announcement_id, student_mail_id, is_read, course_id)
            VALUES (%s, %s, %s, %s, %s)
            '''
            args = (str(uuid4()), announcement_id, student[0], False, int(request.form['course_id']))
            connection.execute_insert_query(query, args, False)

        # Clear cache to ensure updated announcements are fetched
        clear_cache("announcements")

    return jsonify({"message": "Announcement created successfully", "announcement_id": announcement_id})

@app.route('/cms/announcements/getAll', methods=["POST"])
def get_announcements_by_teacher():
    user_id = request.form['user_id']
    course_id = request.form['course_id']  # Fetch course_id from query parameters
    
    if not user_id or not course_id:
        return jsonify({"error": "user_id and course_id are required"}), 400
    
    with Postgres() as connection:
        # Query to fetch all announcements for a specific teacher and course
        query = '''
        SELECT id, course_id, teacher_mail_id, title, message, created_at
        FROM announcements
        WHERE teacher_mail_id = %s AND course_id = %s
        ORDER BY created_at DESC
        '''
        args = (user_id, int(course_id))  # user_id and course_id passed as arguments
        announcements = connection.execute_select_query(query, args)
        
        if not announcements:
            return jsonify({"message": "No announcements found"}), 404
        
        # Return the fetched announcements
        return jsonify({
            "announcements": [
                {
                    "id": ann[0],
                    "course_id": ann[1],
                    "teacher_mail_id": ann[2],
                    "title": ann[3],
                    "message": ann[4],
                    "created_at": ann[5]
                } for ann in announcements
            ]
        }), 200
@app.route('/cms/announcements/send_notifications', methods=["POST"])
def send_notifications_via_mail():
    announcement_id = request.form['announcement_id']

    if not announcement_id:
        return jsonify({"error": "Announcement ID is required"}), 400

    # Fetch announcement details (title, message) from announcements table
    with Postgres() as connection:
        # Fetch announcement details
        query = "SELECT title, message FROM announcements WHERE id = %s"
        announcement = connection.execute_select_query(query, (announcement_id,))

        if not announcement:
            return jsonify({"error": "Announcement not found"}), 404

        title, message = announcement[0]  # Extract title and message

        # Fetch student emails from announcement_recipients table
        query = "SELECT student_mail_id FROM announcement_recipients WHERE announcement_id = %s"
        student_emails = connection.execute_select_query(query, (announcement_id,))

        if not student_emails:
            return jsonify({"error": "No students found for this announcement"}), 404

        recipients = [email[0] for email in student_emails]  # Extract emails

    # Send email to each student
    send_email(recipients, title, message)

    return jsonify({"message": "Emails sent successfully"}), 200

def send_email(recipients, subject, body):
    sender_email = "metilda.notify@gmail.com"
    sender_password = "ggiy wcne omcj wdyu"
    
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["Subject"] = subject
    msg["To"] = ", ".join(recipients)
    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        
        server.sendmail(sender_email, recipients, msg.as_string())  # Send to all recipients at once
        
        server.quit()
        print("Emails sent successfully!")
    
    except Exception as e:
        print("Error sending emails:", e)

@app.route('/cms/activities/create', methods=["POST"])
def create_activity():
    try:
        # Retrieve form data
        words = json.loads(request.form.get("words", "[]"))
        target_types = json.loads(request.form.get("targetType", "[]"))
        target_values = json.loads(request.form.get("targetValue", "[]"))
        difficulty_level = int(request.form.get("difficulty_level", 0))
        course_no = int(request.form.get("course_no", 0))

        # Ensure all values are present
        if not words or not target_types or not target_values:
            return jsonify({"status": "error", "message": "Missing words, target types, or target values."}), 400

        # Get the max activity_number from the database and increment it by 1
        with Postgres() as connection:
            query = "SELECT MAX(activity_number) FROM activity_content"
            result = connection.execute_select_query(query)
            activity_number = result[0][0] + 1 if result[0][0] is not None else 1
            

        # Prepare data for inserting into the database
        activity_content = []

        for i in range(len(words)):
            word = words[i]
            target_type = target_types[i]
            target_value = target_values[i]

            # Create entry for activity_content
            entry = (activity_number, word, target_value if target_type == "image" else "", datetime.now(), difficulty_level, course_no, target_value if target_type == "word" else "")
            activity_content.append(entry)


        # Insert the data into the database
        with Postgres() as connection:
            query = '''
                INSERT INTO activity_content(activity_number, word, image_url, created_at, difficulty_level, course_no, matching_word)
                VALUES(%s, %s, %s, %s, %s, %s, %s)
            '''
            for entry in activity_content:
                connection.execute_insert_query(query, entry, False)

        # Clear any relevant cache
        clear_cache("activity_content")

        return jsonify({"success": "Activity content added successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
    user_id = request.form['user_id']
    conversation_id = request.form['conversation_id']

    # Ensure required parameters are provided
    if not user_id or not conversation_id:
        return jsonify({"error": "Missing required parameters"}), 400

    with Postgres() as connection:
        # Verify if the user is authorized
        query = 'SELECT user_role FROM user_role WHERE user_id = %s AND verified = true'
        args = (user_id,)
        if not connection.execute_select_query(query, args):
            return jsonify({"error": "Unauthorized access"}), 403

        # Update the `is_read` status for all messages in the specified conversation
        update_query = '''
        UPDATE messages
        SET is_read = true
        WHERE conversation_id = %s
        '''
        update_args = (conversation_id)

        try:
            rows_updated = connection.execute_update_query(update_query, update_args)
            if rows_updated == 0:
                return jsonify({"message": "No messages to update or already read"}), 200

        except Exception as e:
            connection.connection.rollback()
            return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Read status updated successfully"}), 200