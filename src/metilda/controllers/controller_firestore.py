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

