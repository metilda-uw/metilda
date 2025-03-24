from __future__ import absolute_import
from __future__ import print_function
import metilda
import psycopg2
import psycopg2.extras
import psycopg2.pool
import os

class Postgres(object):
    connection_pool = None  # Static connection pool

    @staticmethod
    def initialize_pool():
        """Initialize the connection pool if not already initialized."""
        if Postgres.connection_pool is None:
            app = metilda.get_app()
            DATABASE_URL = os.environ['DATABASE_URL']
            minconn = 1
            maxconn = 50  # Adjust based on expected load

            print("Initializing connection pool...")

            try:
                Postgres.connection_pool = psycopg2.pool.SimpleConnectionPool(
                    minconn, maxconn, dsn=DATABASE_URL, sslmode='require' if not app.config['TESTING'] else None
                )
                print("Connection pool initialized.")
            except Exception as error:
                print(f"Error initializing connection pool: {error}")
                raise

    def __init__(self):
        """Acquire a connection from the pool."""
        if Postgres.connection_pool is None:
            Postgres.initialize_pool()
        self.connection = None
        self.cursor = None

    def __enter__(self):
        """Get a connection from the pool."""
        if Postgres.connection_pool.getconn() is None:
            Postgres.initialize_pool()
        try:
            self.connection = Postgres.connection_pool.getconn()
            self.cursor = self.connection.cursor()
            print("Connection acquired from pool.")
        except Exception as error:
            print(f"Error acquiring connection from pool: {error}")
            self.connection = None
            self.cursor = None
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Commit transaction and release connection back to pool."""
        if self.connection:
            try:
                if self.cursor:
                    self.cursor.close()  # Close cursor only if it exists
                    print("Cursor closed.")

                self.connection.commit()  # Commit changes
                print("Transaction committed.")
            except Exception as error:
                print(f"Error during commit or cursor close: {error}")
            finally:
                if self.connection and Postgres.connection_pool:
                    try:
                        Postgres.connection_pool.putconn(self.connection, close=False)  # Ensure it's a valid connection
                        print("Connection returned to pool.")
                    except Exception as error:
                        print(f"Error returning connection to pool: {error}")
                    self.connection = None  # Ensure reference is removed

    def execute_update_query(self, query, record):
        try:
            self.cursor.execute(query, record)
            return self.cursor.rowcount
        except Exception as error:
            print(f'Error executing query "{query}", error: {error}')
            return None

    def execute_insert_query(self, query, record, need_last_row_id=True):
        psycopg2.extras.register_uuid()
        try:
            self.cursor.execute(query, record)
            if need_last_row_id:
                last_row_id = self.cursor.fetchone()[0]
                return last_row_id
        except Exception as error:
            print(f'Error executing query "{query}", error: {error}')
            return None

    def execute_select_query(self, query, record=None):
        try:
            if record:
                self.cursor.execute(query, record)
            else:
                self.cursor.execute(query)
            return self.cursor.fetchall()
        except Exception as error:
            print(f'Error executing query "{query}", error: {error}')
            return None
