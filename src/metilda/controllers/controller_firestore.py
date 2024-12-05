from flask import jsonify, request, Response
import uuid

from metilda import app
from .Postgres import Postgres


@app.route('/api/collections', methods=["GET", "POST", "DELETE"])
@app.route('/api/collections/<id>', methods=["PUT"])
def getOrCreate_Collections(id = "0"):
    req_method = request.method

    if req_method == "GET":
        with Postgres() as connection:
            postgres_select_query = """ SELECT * FROM COLLECTIONS """
            filter_values=()
            results = connection.execute_select_query(postgres_select_query,(filter_values,))
            # print(results)
        return jsonify({'result': results})

    elif req_method == "POST":
        with Postgres() as connection:
            tmp_uuid = str(uuid.uuid4())
            postgres_insert_query = """ INSERT INTO collections (COLLECTION_ID, COLLECTION_NAME, OWNER_ID, CREATED_AT, COLLECTION_DESCRIPTION, COLLECTION_LUID) VALUES (DEFAULT, %s, %s, CURRENT_TIMESTAMP, %s, %s ) RETURNING COLLECTION_ID """
            record_to_insert = (request.form['collection_name'],request.form['owner_id'],request.form['collection_description'], tmp_uuid  )
            last_row_id = connection.execute_insert_query(postgres_insert_query, record_to_insert)
        
        # if query does not return last_row_id return error
        if last_row_id is None:
            return Response("{'result': 'query unsuccessful'}", status=500, mimetype='application/json')
        else:
            return jsonify({'result': tmp_uuid})

    elif req_method == "DELETE":
        with Postgres() as connection:
            postgres_delete_query = """ DELETE FROM collections WHERE COLLECTION_NAME = %s """
            result = connection.execute_update_query(postgres_delete_query, (request.form['collection_name'], ) )

        # if results = 1 then success, if none then failed
        #TODO: Figure out why this doesn't work when there is data in the "{}"
        if result is None:
            return Response("{}", status=500, mimetype='application/json')
        else:
            return jsonify({'result': 'success'})
            
    elif req_method == "PUT":
        print("calling update...")
        req_method = request.method
        if req_method == "PUT":
            print("updating collection")
            with Postgres() as connection:
                postgres_delete_query = """ UPDATE collections SET COLLECTION_NAME = %s WHERE COLLECTION_ID =  """ + id
                result = connection.execute_update_query(postgres_delete_query, (request.form['collection_name'], ) )

            # if results = 1 then success, if none then failed
            #TODO: Figure out why this doesn't work when there is data in the "{}"
            if result is None:
                return Response("{}", status=500, mimetype='application/json')
            else:
                return jsonify({'result': 'success'})


###########################################################################
###################### backend code for Feedback  #########################
###########################################################################


# For Questions table manipulations
#---------------------------\\------------------------------------#

# Get all questions that are active
@app.route('/api/getQuestions', methods=["GET"])
def getquestions():
    with Postgres() as question:
        postgres_select_query = """ 
        SELECT * 
        FROM QUESTIONS
        WHERE isactive = TRUE
        ORDER BY textflag ASC
        """
        filter_values = ()
        results = question.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

# Get all questions
@app.route('/api/getAllQuestions', methods=["GET"])
def getallquestions():
    with Postgres() as question:
        postgres_select_query = """ 
        SELECT * 
        FROM QUESTIONS
        ORDER BY textflag ASC
        """
        filter_values = ()
        results = question.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

# Get question value by qid
@app.route('/api/getQuestionValue/<int:qid>', methods=["GET"]) 
def get_question_value(qid):
    try:
        with Postgres() as question:
            postgres_select_query = """ 
            SELECT Questionvalue
            FROM QUESTIONS
            WHERE QID = %s
            """
            # Execute query with qid as the parameter
            results = question.execute_select_query(postgres_select_query, (qid,))
        
        # Return the results
        return jsonify({'result': results})
    
    except Exception as e:
        return jsonify({'error': str(e)})

# Add new question 
@app.route('/api/addQuestion', methods=["POST"])
def addQuestion():
    print("here")
    with Postgres() as question:
        postgres_insert_query = """ 
        INSERT INTO QUESTIONS (qid, questionvalue, textflag, isactive, createdby, createddate) 
        VALUES    (DEFAULT, %s, %s, %s, %s, CURRENT_TIMESTAMP ) 
        RETURNING qid 
        """
        record_to_insert = (request.form['QUESTIONVALUE'],request.form['TEXTFLAG'],request.form['ISACTIVE'], request.form['CREATEDBY'])
        last_row_id = question.execute_insert_query(postgres_insert_query, record_to_insert)
        
    # if query does not return last_row_id return error
    if last_row_id is None:
        return Response("{'result': 'query unsuccessful'}", status=500, mimetype='application/json')
        
    return jsonify({'result': last_row_id})

# Delete question 
@app.route('/api/deleteQuestion/<int:qid>', methods=["DELETE"])
def deleteQuestion(qid):
    with Postgres() as connection:
        postgres_delete_query = """ 
        DELETE FROM QUESTIONS
        WHERE qid = %s 
        """
        record_to_delete = (qid,)
        result = connection.execute_update_query(postgres_delete_query,record_to_delete)

    # if results = 1 then success, if none then failed
    if result is None or result == 0:
        return Response("{}", status=500, mimetype='application/json')
        
    return jsonify({'result': 'success'})

# Update question value
@app.route('/api/updateQuestion/<id>', methods=["PUT"])
def updateQuestion(id="0"):        
    with Postgres() as question:
        postgres_update_query = """ 
        UPDATE QUESTIONS 
        SET questionvalue = %s 
        WHERE qid = %s
        """ 
        result = question.execute_update_query(postgres_update_query, (request.form['QUESTION_VALUE'], id))

    # if results = 1 then success, if none then failed
    if result is None or result == 0:
        return Response("{}", status=500, mimetype='application/json')
    
    return jsonify({'result': 'success'})

# Update question status
@app.route('/api/updateQuestionStatus/<id>', methods=["PUT"])
def updateQuestionStatus(id="0"):        
    with Postgres() as question:
        postgres_update_query = """ 
        UPDATE QUESTIONS 
        SET isactive = %s 
        WHERE qid = %s
        """ 
        result = question.execute_update_query(postgres_update_query, (request.form['ISACTIVE'], id))

    # if results = 1 then success, if none then failed
    if result is None or result == 0:
        return Response("{}", status=500, mimetype='application/json')
    
    return jsonify({'result': 'success'})

# For options table manipulations
#---------------------------\\------------------------------------#

# To get all options
@app.route('/api/getOptions', methods=["GET"])
def getOptions():
    with Postgres() as option:
        postgres_select_query = """ 
        SELECT * 
        FROM OPTIONS
        """
        filter_values = ()
        results = option.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

#get option value using its oid
@app.route('/api/getOptionValue/<int:oid>', methods=["GET"])
def get_option_value(oid):
    with Postgres() as option:
        postgres_select_query = """ 
        SELECT OptionValue
        FROM OPTIONS
        WHERE OID = %s
        """
        # Execute query with oid as the parameter
        results = option.execute_select_query(postgres_select_query, (oid,))
    return jsonify({'result': results})

# Add new option 
@app.route('/api/addOption', methods=["POST"])
def addOption():
    with Postgres() as option:
        postgres_insert_query = """ 
        INSERT INTO OPTIONS (oid, optionvalue, createdby, createddate) 
        VALUES    (DEFAULT, %s, %s, CURRENT_TIMESTAMP ) 
        RETURNING oid 
        """
        record_to_insert = (request.form['OPTIONVALUE'], request.form['CREATEDBY'])
        last_row_id = option.execute_insert_query(postgres_insert_query, record_to_insert)
        
    # if query does not return last_row_id return error
    if last_row_id is None:
        return Response("{'result': 'query unsuccessful'}", status=500, mimetype='application/json')
        
    return jsonify({'result': last_row_id})

# Update option value
@app.route('/api/updateOption/<id>', methods=["PUT"])
def updateOption(id="0"):        
    with Postgres() as option:
        postgres_update_query = """ 
        UPDATE OPTIONS
        SET optionvalue = %s 
        WHERE oid = %s
        """ 
        result = option.execute_update_query(postgres_update_query, (request.form['OPTIONVALUE'], id))

    # if results = 1 then success, if none then failed
    if result is None or result == 0:
        return Response("{}", status=500, mimetype='application/json')
    
    return jsonify({'result': 'success'})

# Delete Option
@app.route('/api/deleteOption/<int:oid>', methods=["DELETE"])
def deleteOption(oid):
    with Postgres() as option:
        postgres_delete_query = """ 
        DELETE FROM OPTIONS 
        WHERE oid = %s 
        RETURNING oid 
        """
        record_to_delete = (oid,)
        deleted_oid = option.execute_update_query(postgres_delete_query, record_to_delete)

    # If no option was deleted, return an error
    if deleted_oid is None:
        return Response("{'result': 'option not found or deletion unsuccessful'}", status=404, mimetype='application/json')

    return jsonify({'result': deleted_oid})


# For answers table manipulations
#---------------------------\\------------------------------------#

# To get all answers
@app.route('/api/getAnswers', methods=["GET"])
def getAnswers():
    with Postgres() as answer:
        postgres_select_query = """ 
        SELECT * 
        FROM ANSWERS
        """
        filter_values = ()
        results = answer.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

# Add new Answer 
@app.route('/api/addAnswer', methods=["POST"])
def addAnswer():
    with Postgres() as answer:
        postgres_insert_query = """ 
        INSERT INTO ANSWERS (aid, qid, oid, answeredby, answereddate) 
        VALUES    (DEFAULT, %s, %s, %s, CURRENT_TIMESTAMP ) 
        RETURNING aid 
        """
        record_to_insert = (request.form['QID'], request.form['OID'], request.form['ANSWEREDBY'])
        last_row_id = answer.execute_insert_query(postgres_insert_query, record_to_insert)
        
    # if query does not return last_row_id return error
    if last_row_id is None:
        return Response("{'result': 'query unsuccessful'}", status=500, mimetype='application/json')
        
    return jsonify({'result': last_row_id})

# Delete Answer
@app.route('/api/deleteAnswer/<int:aid>', methods=["DELETE"])
def deleteAnswer(aid):
    with Postgres() as answer:
        postgres_delete_query = """ 
        DELETE FROM ANSWERS 
        WHERE aid = %s 
        RETURNING aid 
        """
        record_to_delete = (aid,)
        deleted_aid = answer.execute_update_query(postgres_delete_query, record_to_delete)

    # If no answer was deleted, return an error
    if deleted_aid is None:
        return Response("{'result': 'answer not found or deletion unsuccessful'}", status=404, mimetype='application/json')

    return jsonify({'result': deleted_aid})

# For comments table manipulations
#---------------------------\\------------------------------------#

# To get all comments
@app.route('/api/getComments', methods=["GET"])
def getComments():
    with Postgres() as comment:
        postgres_select_query = """ 
        SELECT * 
        FROM COMMENTS
        """
        filter_values = ()
        results = comment.execute_select_query(postgres_select_query, (filter_values,))
    return jsonify({'result': results})

#get option value using its cid
@app.route('/api/getCommentValue/<int:cid>', methods=["GET"])
def get_comment_value(cid):
    with Postgres() as option:
        postgres_select_query = """ 
        SELECT commentvalue
        FROM COMMENTS
        WHERE OID = %s
        """
        # Execute query with oid as the parameter
        results = option.execute_select_query(postgres_select_query, (cid,))
    return jsonify({'result': results})

# Add new Comment 
@app.route('/api/addComment', methods=["POST"])
def addComment():
    with Postgres() as answer:
        postgres_insert_query = """ 
        INSERT INTO COMMENTS (cid, qid, commentvalue, commentedby, createddate) 
        VALUES    (DEFAULT, %s, %s, %s, CURRENT_TIMESTAMP ) 
        RETURNING cid 
        """
        record_to_insert = (request.form['QID'], request.form['COMMENTVALUE'], request.form['COMMENTEDBY'])
        last_row_id = answer.execute_insert_query(postgres_insert_query, record_to_insert)
        
    # if query does not return last_row_id return error
    if last_row_id is None:
        return Response("{'result': 'query unsuccessful'}", status=500, mimetype='application/json')
        
    return jsonify({'result': last_row_id})

# Delete Comment
@app.route('/api/deleteComment/<int:cid>', methods=["DELETE"])
def deleteComment(cid):
    with Postgres() as comment:
        postgres_delete_query = """ 
        DELETE FROM COMMENTS WHERE cid = %s 
        RETURNING cid 
        """
        record_to_delete = (cid,)
        deleted_cid = comment.execute_update_query(postgres_delete_query, record_to_delete)

    # If no comment was deleted, return an error
    if deleted_cid is None:
        return Response("{'result': 'comment not found or deletion unsuccessful'}", status=404, mimetype='application/json')

    return jsonify({'result': deleted_cid})
