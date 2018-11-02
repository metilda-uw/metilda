import os

import json
from flask import request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from main import app


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
