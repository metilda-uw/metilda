from main import app
from flask import request, jsonify


@app.route('/api/upload-audio-file', methods=["POST"])
def upload_audio_file():
    return jsonify({"id": "123456"})


@app.route('/api/upload-audio-metadata', methods=["POST"])
def upload_audio_metadata():
    return jsonify({"status": "good"})