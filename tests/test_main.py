from main import app
import json
import unittest


class MainTest(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
