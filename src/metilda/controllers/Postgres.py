from __future__ import absolute_import
from __future__ import print_function
import metilda
import psycopg2
import psycopg2.extras
import os

class Postgres(object):
    """ Class that contains the details of Postgres database """ 
    def __init__(self):
        self.connection = None
        self.cursor = None
    
    """ ___enter__ method  """
    def __enter__(self):
        app = metilda.get_app()
        DATABASE_URL = os.environ['DATABASE_URL']
        print("Testing: " + str(app.config['TESTING']) + "\n Database URL: " + DATABASE_URL)

        try:
            print('connecting to PostgreSQL database...')

            if (app.config['TESTING']) == True:
                self.connection = psycopg2.connect(DATABASE_URL)    
            else:
                self.connection = psycopg2.connect(DATABASE_URL, sslmode='require')

            self.cursor = self.connection.cursor()

        except Exception as error:
            print(('Error: connection not established {}'.format(error)))
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
            print(('error execting query "{}", error: {}'.format(query, error)))
            return None
        else:
            return self.cursor.rowcount
    
    def execute_insert_query(self, query, record, need_last_row_id=True):
        psycopg2.extras.register_uuid()
        try:
            self.cursor.execute(query, record)
        except Exception as error:
            print(('error execting query "{}", error: {}'.format(query, error)))
            return None
        else:
            if need_last_row_id:
                print('last row id is: ')

                last_row_id = self.cursor.fetchone()[0]

                print(last_row_id)
                return last_row_id
    
    def execute_select_query(self, query, record = None):
        try:
            if record:
                self.cursor.execute(query, record)
            else:
                self.cursor.execute(query)
        except Exception as error:
            print(('error execting query "{}", error: {}'.format(query, error)))
            return None
        else:
            return self.cursor.fetchall()