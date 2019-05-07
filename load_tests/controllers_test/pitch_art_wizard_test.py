"""
Run with this command from the root-level folder:
./venv/Scripts/locust.exe --host http://localhost:5000  -f load_tests/controllers_test/pitch_art_wizard_test.py
"""
import os

from locust import HttpLocust, TaskSet, task


class WebsiteTasks(TaskSet):
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


class WebsiteUser(HttpLocust):
    task_set = WebsiteTasks
    min_wait = 5000
    max_wait = 15000
