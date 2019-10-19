import psycopg2
import os
class Postgres(object):
    def __init__(self):
        self.connection = None
        self.cursor = None
    
    def __enter__(self):
      
        DATABASE_URL = os.environ['DATABASE_URL']
        print(DATABASE_URL)
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

    def query(self, query):
        try:
            result = self.cursor.execute(query)
        except Exception as error:
            print('error execting query "{}", error: {}'.format(query, error))
            return None
        else:
            return result
    
    def query_with_record(self, query, record):
        try:
            result = self.cursor.execute(query, record)
        except Exception as error:
            print('error execting query "{}", error: {}'.format(query, error))
            return None
        else:
            return result