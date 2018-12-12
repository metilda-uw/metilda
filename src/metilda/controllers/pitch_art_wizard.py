import os

from flask import request, jsonify, send_file

from metilda import app
from metilda.services import audio_analysis, file_io


@app.route('/api/upload-audio-file', methods=["POST"])
def upload_audio_file():
    pass


@app.route('/api/upload-audio-metadata', methods=["POST", "GET"])
def upload_audio_metadata():
    pass


@app.route('/api/audio-analysis-image/<string:upload_id>.png', methods=["GET"])
def audio_analysis_image(upload_id):
    image_path = os.path.join(app.config["SOUNDS"], upload_id)

    tmin = request.args.get('tmin', -1, type=float)
    tmax = request.args.get('tmax', -1, type=float)
    max_pitch = request.args.get('max-pitch', float('inf'), type=float)

    image_binary = audio_analysis.audio_analysis_image(
        image_path,
        max_pitch=max_pitch,
        tmin=tmin,
        tmax=tmax)

    return send_file(image_binary, mimetype="imaZge/png")
    # # return send_file(r"C:\Users\Mitchell\Downloads\img3.png")
    # file_name = os.path.splitext(upload_id)[0]
    # image_path = os.path.join(app.config["PICTURES"], file_name + ".png")
    # return send_file(image_path)


@app.route('/api/audio/<string:upload_id>', methods=["GET"])
def audio(upload_id):
    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    tmin = request.args.get('tmin', -1, type=float)
    tmax = request.args.get('tmax', -1, type=float)
    file_bytes = audio_analysis.get_audio(sound_path, tmin=tmin, tmax=tmax)
    return send_file(file_bytes, mimetype="audio/wav")


@app.route('/api/max-pitches/<string:upload_id>', methods=["POST"])
def max_pitches(upload_id):
    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    max_pitch = request.args.get('max-pitch', float('inf'), type=float)
    pitches = audio_analysis.get_max_pitches(request.json['time_ranges'], sound_path, max_pitch)
    return jsonify(pitches)


@app.route('/api/sound-length/<string:upload_id>', methods=["POST"])
def sound_length(upload_id):
    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    sound_length = audio_analysis.get_sound_length(sound_path)
    return jsonify({'sound_length': sound_length})


@app.route('/api/available-files', methods=["GET"])
def available_files():
    return jsonify({'available_files': file_io.available_files(app.config["SOUNDS"])})