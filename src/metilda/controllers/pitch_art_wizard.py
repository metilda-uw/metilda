import os

from flask import request, jsonify, send_file

from metilda import app
from metilda.services import audio_analysis


@app.route('/api/upload-audio-file', methods=["POST"])
def upload_audio_file():
    pass


@app.route('/api/upload-audio-metadata', methods=["POST", "GET"])
def upload_audio_metadata():
    pass


@app.route('/api/audio-analysis-image/<string:upload_id>.png', methods=["GET"])
def audio_analysis_image(upload_id):
    # image_path = os.path.join(app.config["SOUNDS"], upload_id)
    # image_binary = audio_analysis.audio_analysis_image(image_path)
    # return send_file(image_binary, mimetype="image/png")
    return send_file(r"C:\Users\Mitchell\Downloads\img3.png")