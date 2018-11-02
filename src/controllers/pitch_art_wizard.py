import os
import io

import json
from flask import request, jsonify, send_from_directory, send_file

from werkzeug.utils import secure_filename
from main import app
from services import audio_analysis


@app.route('/api/upload-audio-file', methods=["POST"])
def upload_audio_file():
    file = request.files["file"]
    file_name = secure_filename(file.filename)
    path = os.path.join(app.config["UPLOAD_FOLDER"], file_name)
    file.save(path)
    return jsonify({"id": file_name.split(".")[0]})


@app.route('/api/upload-audio-metadata', methods=["POST", "GET"])
def upload_audio_metadata():
    upload_json = request.get_json()
    file_name = secure_filename(upload_json["id"] + ".json")
    path = os.path.join(app.config["UPLOAD_FOLDER"], file_name)
    if request.method == "POST":
        with open(path, "w") as fh:
            json.dump(upload_json, fh)
            return "", 200
    else:
        with open(path, "r") as fh:
            return jsonify(json.load(fh))


@app.route('/api/audio-analysis-image/<string:upload_id>.png', methods=["GET"])
def audio_analysis_image(upload_id):
    with open(os.path.join(app.config["UPLOAD_FOLDER"], upload_id + ".json")) as fh:
        upload_json = json.load(fh)
        upload_path = os.path.join(app.config["UPLOAD_FOLDER"], upload_json["audioFileName"])
        image_binary = audio_analysis.audio_analysis_image(upload_path)
        return send_file(image_binary, mimetype="image/png")