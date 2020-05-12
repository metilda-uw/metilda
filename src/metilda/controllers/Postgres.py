import psycopg2
import os
class Postgres(object):
    def __init__(self):
        self.connection = None
        self.cursor = None
    
    def __enter__(self):
      
        DATABASE_URL = 'postgres://jphpsdahxkaoiw:3d39eb97981c1ecd7aae48ddf5a0114655bec6aff9a29dc77b764c6f4b0f106a@ec2-23-21-66-88.compute-1.amazonaws.com:5432/d294qe44mi8a5v'
        print("====>" + DATABASE_URL)
        try:
            print('connecting to PostgreSQL database...')
            self.connection =  psycopg2.connect(DATABASE_URL, sslmode='require')
            self.cursor = self.connection.cursor()

        except Exception as error:
            print('Error: connection not established {}'.format(error))
            self.connection = None
            self.cursor =  None

        else:
            print('connection established')

        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.connection.commit()
        print('connection committed')
        self.cursor.close()
        print('cursor closed')
        self.connection.close()
        print('connection closed')

    def execute_update_query(self, query, record):
        try:
            self.cursor.execute(query, record)
        except Exception as error:
            print('error execting query "{}", error: {}'.format(query, error))
            return None
        else:
            return self.cursor.rowcount
    
    def execute_insert_query(self, query, record):
        try:
            self.cursor.execute(query, record)
        except Exception as error:
            print('error execting query "{}", error: {}'.format(query, error))
            return None
        else:
            print('last row id is: ')
            last_row_id=self.cursor.fetchone()[0]
            print(last_row_id)
            return last_row_id
    
    def execute_select_query(self, query, record):
        try:
            self.cursor.execute(query, record)
        except Exception as error:
            print('error execting query "{}", error: {}'.format(query, error))
            return None
        else:
            return self.cursor.fetchall()