from main import app
import json
import unittest


class MainTest(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_hello_world(self):
        response = self.app.get("/api/hello_world")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data), {"hello": "world"})
