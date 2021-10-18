try:
    import unittest
    from metilda import get_app


except Exception as e:
    print("Some modules are Missing {}".format(e))

class FlaskTestCase(unittest.TestCase):

    #Check if response is 200
    def test_index(self):
        tester = get_app().test_client(self)
        response = tester.get("/api")
        statuscode=response.status_code
        self.assertEqual(statuscode, 200)

    def test_index_content(self):
        tester = get_app().test_client(self)
        response = tester.get("/api")
        self.assertEqual(response.content_type , "text/html; charset=utf-8")

    def test_index_data(self):
        tester = get_app().test_client(self)
        response = tester.get("/api")
        self.assertTrue(b'Hello!' in response.data)


if __name__ == "__main__":
    unittest.main()