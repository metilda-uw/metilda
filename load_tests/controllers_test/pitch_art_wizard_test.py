"""
Run with this command from the root-level folder:
./venv/Scripts/locust.exe --host https://metilda.herokuapp.com -f load_tests/controllers_test/pitch_art_wizard_test.py
"""
import os

from locust import HttpLocust, TaskSet, task
from test_data import *


class WebsiteTasks(TaskSet):
    email = "NOT_FOUND"
    username = "NOT_FOUND"
    university="NOT_FOUND"
    role="NOT_FOUND"
    research_language="NOT_FOUND"
    file_name="NOT_FOUND"
    file_path="NOT_FOUND"
    file_type="NOT_FOUND"
    file_size="NOT_FOUND"
    file_id="NOT_FOUND"
    image_name="NOT_FOUND"
    image_path="NOT_FOUND"
    analysis_file_name="NOT_FOUND"
    analysis_file_path="NOT_FOUND"
    analysis_id="NOT_FOUND"
    image_id="NOT_FOUND"
    def on_start(self):
        if len(USER_DETAILS) > 0:
            self.email, self.username,self.university, self.role, self.research_language, self.file_name,self.file_path,self.file_type,self.file_size,self.file_id,self.image_name, self.image_path = USER_DETAILS.pop()
        if len(USER_ANALYSIS) > 0:
            self.file_id,self.analysis_file_name,self.analysis_file_path=USER_ANALYSIS.pop()
        if len(IMAGE_ANALYSIS) > 0:
            self.analysis_id,self.image_id=IMAGE_ANALYSIS.pop()
        if len(UPDATE_ANALYSIS) > 0:
            self.analysis_id,self.analysis_file_path=UPDATE_ANALYSIS.pop()
    @task
    def audio_analysis_image(self):
        self.client.get(
            "/api/audio/EOP-AF-saahkomaapiwa_mono.wav.png/image?min-pitch=75&max-pitch=500"
        )

    @task
    def audio(self):
        self.client.get("/api/audio/EOP-AF-saahkomaapiwa_mono.wav/file")

    @task
    def avg_pitch(self):
        self.client.get(
            "/api/audio/EOP-AF-saahkomaapiwa_mono.wav/pitch"
            "/avg?t0=1.0767675523850029&t1=1.1826990569831863&max-pitch=500&min-pitch=75"
        )

    @task
    def all_audio_pitches(self):
        self.client.get(
            "/api/audio/EOP-AF-saahkomaapiwa_mono.wav/pitch"
            "/range?max-pitch=500&min-pitch=75&t0=1.036024666001086&t1=1.1826990569831863"
        )

    @task
    def all_upload_pitches(self):
        file_path = os.path.join(os.path.dirname(__file__),
                                 r"user_saahkomaapiwa_recording.wav")
        self.client.post(
            "/api/upload/pitch/range?min-pitch=30.0&max-pitch=300.0",
            files={'file': open(file_path, 'rb')}
        )

    @task
    def sound_length(self):
        self.client.get("/api/audio/EOP-AF-saahkomaapiwa_mono.wav/duration")

    @task
    def available_files(self):
        self.client.get("/api/audio")
    
    @task
    def download_file(self):
        file_path = os.path.join(os.path.dirname(__file__),
                                 r"user_saahkomaapiwa_recording.wav")
        self.client.post(
            "/api/audio/download-file",
            files={'file': open(file_path, 'rb')}
        )

# Run the below task after commenting the above tasks because on_start function should only be called before executing this task.
# If all the tasks are run at once, the on_start function runs before every task which pops the elements from test data which is not required.
    @task
    def create_db_user(self):
        self.client.post("/api/create-user", {
            'user_id': self.email, 'user_name': self.username,'university':self.university
        })
        self.client.post(
            "/api/create-user-research-language",
            {
            'user_id': self.email, 'language': self.research_language
        })
        self.client.post(
            "/api/create-user-role",
            {
            'user_id': self.email, 'user_role': self.role
        })
        self.client.post(
            "/api/update-user",
            {
            'user_id': self.email
        })
        self.client.post(
            "/api/create-file",
            {
            'user_id': self.email, 'file_name': self.file_name,'file_path':self.file_path,'file_type':self.file_type,
            'file_size':self.file_size
        })
        self.client.post(
            "/api/create-image",
            {
            'user_id': self.email, 'image_name': self.image_name,'image_path':self.image_path
        })
        # The below service calls should be executed in parts only after running the above services and modifying the test data in test_data.py file with the new data
        self.client.post(
            "/api/create-analysis",
            {
            'file_id': self.file_id, 'analysis_file_name': self.analysis_file_name,'analysis_file_path':self.analysis_file_path
        })
        self.client.post(
            "/api/create-image-analysis",
            {
            'image_id': self.image_id, 'analysis_id': self.analysis_id
        })
        self.client.post(
            "/api/update-analysis",
            {
            'analysis_file_path': self.analysis_file_path, 'analysis_id': self.analysis_id
        })
        self.client.post(
            "/api/delete-image",
            {
            'image_id': self.image_id
        })
        self.client.post(
            "/api/delete-recording",
            {
            'user_id': self.email,'file_path': self.file_path,'file_type': self.file_type
        })
        self.client.post(
            "/api/delete-file",{
                'file_id':self.file_id
            })
        self.client.post(
            "/api/delete-user",
            {
            'user_id': self.email
        })
        


class WebsiteUser(HttpLocust):
    task_set = WebsiteTasks
    min_wait = 5000
    max_wait = 15000
