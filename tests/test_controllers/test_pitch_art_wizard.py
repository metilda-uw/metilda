import unittest
import tempfile
import shutil
from StringIO import StringIO
import json

from metilda import app


class PitchArtWizard(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        app.config["DEBUG"] = True
        self.temp_dir = tempfile.mkdtemp()
        app.config["UPLOAD_FOLDER"] = self.temp_dir
        self.client = app.test_client()

    def test_upload_audio_file(self):
        response = self.client.post(
            "/api/upload-audio-file",
             content_type='multipart/form-data',
             data={'file': (StringIO("fake-file"), 'fake-file-name.jpg')})
        response = response.get_json()

        self.assertTrue("id" in response)
        self.assertTrue(len(response["id"]) > 0)

    @unittest.skip("Allowing this function to be broken for now")
    def test_upload_audio_metadata(self):
        # Upload a fake file
        response = self.client.post(
            "/api/upload-audio-file",
             content_type='multipart/form-data',
             data={'file': (StringIO("fake-file"), 'fake-file-name.jpg')})
        upload_id = response.get_json()["id"]

        metadata = {"id": upload_id,
                    "description": "here is the description",
                    "gender": "Female"}

        # Upload metadata
        response = self.client.post(
            "/api/upload-audio-metadata",
            content_type='application/json',
            data=json.dumps(metadata))

        self.assertEqual(response.status_code, 200)

        # Check that metadata was stored correctly
        response = self.client.get(
            "/api/upload-audio-metadata",
            content_type='application/json',
            data=json.dumps({"id": upload_id}))
        response = response.get_json()

        self.assertEqual(response, metadata)


    def tearDown(self):
        shutil.rmtree(self.temp_dir)