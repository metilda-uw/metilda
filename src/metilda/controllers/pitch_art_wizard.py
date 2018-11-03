import io
import os
import tempfile

import json
from flask import request, jsonify, send_file
from werkzeug.utils import secure_filename
from metilda import app, db
from metilda.services import audio_analysis
from metilda.models.uploads import MetildaUpload


@app.route('/api/upload-audio-file', methods=["POST"])
def upload_audio_file():
    file = request.files["file"]
    # path = os.path.join(app.config["UPLOAD_FOLDER"], file_name)
    # file.save(path)
    with db.transaction() as conn:
        file_bytes = io.BytesIO()
        file.save(file_bytes)
        file_bytes.seek(0)
        conn.root.upload_crud.upload_lookup[file.filename] = MetildaUpload(file_bytes)

    return jsonify({"id": file.filename})


@app.route('/api/upload-audio-metadata', methods=["POST", "GET"])
def upload_audio_metadata():
    upload_json = request.get_json()
    return "", 200
    # with
    #
    # if request.method == "POST":
    #     with open(path, "w") as fh:
    #         json.dump(upload_json, fh)
    #         return "", 200
    # else:
    #     with open(path, "r") as fh:
    #         return jsonify(json.load(fh))


@app.route('/api/audio-analysis-image/<string:upload_id>.png', methods=["GET"])
def audio_analysis_image(upload_id):
    # with open(os.path.join(app.config["UPLOAD_FOLDER"], upload_id + ".json")) as fh:
        # upload_json = json.load(fh)
        # upload_path = os.path.join(app.config["UPLOAD_FOLDER"], upload_json["audioFileName"])
    with db.transaction() as conn, tempfile.NamedTemporaryFile(delete=False) as temp_fh:
        metilda_upload = conn.root.upload_crud.upload_lookup[upload_id]
        temp_fh.write(metilda_upload.file_bytes.getvalue())
        image_binary = audio_analysis.audio_analysis_image(temp_fh.name)
        temp_fh.close()
        return send_file(image_binary, mimetype="image/png")
        # with open(temp_fh.name, "rb") as audio_fh:
        #     image_binary = audio_analysis.audio_analysis_image(audio_fh)
        #     return send_file(image_binary, mimetype="image/png")