import os
import shutil
import tempfile

from flask import request, jsonify, send_file

from metilda import app
from metilda.default import MIN_PITCH_HZ, MAX_PITCH_HZ
from metilda.services import audio_analysis, file_io


@app.route('/api/audio/<string:upload_id>.png/image', methods=["GET"])
def audio_analysis_image(upload_id):
    image_path = os.path.join(app.config["SOUNDS"], upload_id)

    tmin = request.args.get('tmin', -1, type=float)
    tmax = request.args.get('tmax', -1, type=float)
    min_pitch = request.args.get('min-pitch', MIN_PITCH_HZ, type=float)
    max_pitch = request.args.get('max-pitch', MAX_PITCH_HZ, type=float)

    image_binary = audio_analysis.audio_analysis_image(
        image_path,
        min_pitch=min_pitch,
        max_pitch=max_pitch,
        tmin=tmin,
        tmax=tmax)

    return send_file(image_binary, mimetype="image/png")


@app.route('/api/audio/<string:upload_id>/file', methods=["GET"])
def audio(upload_id):
    if upload_id == "undefined":
        # This is the case when the page load and a file has
        # not been selected
        return "", 204

    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    tmin = request.args.get('tmin', -1, type=float)
    tmax = request.args.get('tmax', -1, type=float)
    file_bytes = audio_analysis.get_audio(sound_path, tmin=tmin, tmax=tmax)
    return send_file(file_bytes, mimetype="audio/wav")


@app.route('/api/audio/<string:upload_id>/pitch/avg', methods=["GET"])
def avg_pitch(upload_id):
    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    t0 = request.args.get('t0', type=float)
    t1 = request.args.get('t1', type=float)
    max_pitch = request.args.get('max-pitch', MAX_PITCH_HZ, type=float)
    min_pitch = request.args.get('min-pitch', MIN_PITCH_HZ, type=float)
    result = audio_analysis.get_avg_pitch((t0, t1), sound_path, min_pitch, max_pitch)
    return jsonify({"avg_pitch": result})


@app.route('/api/audio/<string:upload_id>/pitch/range', methods=["GET"])
def all_audio_pitches(upload_id):
    max_pitch = request.args.get('max-pitch', MAX_PITCH_HZ, type=float)
    min_pitch = request.args.get('min-pitch', MIN_PITCH_HZ, type=float)
    t0 = request.args.get('t0', 0, type=float)
    t1 = request.args.get('t1', float('inf'), type=float)

    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    pitches = audio_analysis.get_all_pitches([t0, t1], sound_path, min_pitch, max_pitch)

    return jsonify({'pitches': pitches})


@app.route('/api/upload/pitch/range', methods=["POST"])
def all_upload_pitches():
    max_pitch = request.args.get('max-pitch', MAX_PITCH_HZ, type=float)
    min_pitch = request.args.get('min-pitch', MIN_PITCH_HZ, type=float)
    t0 = request.args.get('t0', 0, type=float)
    t1 = request.args.get('t1', float('inf'), type=float)

    temp_dir = tempfile.mkdtemp()
    audio_file = request.files['file']
    sound_path = os.path.join(temp_dir, "audio.wav")
    audio_file.save(sound_path)

    pitches = audio_analysis.get_all_pitches([t0, t1], sound_path, min_pitch, max_pitch)
    shutil.rmtree(temp_dir)

    return jsonify({'pitches': pitches})


@app.route('/api/audio/<string:upload_id>/duration', methods=["GET"])
def sound_length(upload_id):
    sound_path = os.path.join(app.config["SOUNDS"], upload_id)
    sound_length = audio_analysis.get_sound_length(sound_path)
    return jsonify({'duration': sound_length})


@app.route('/api/audio', methods=["GET"])
def available_files():
    return jsonify({'ids': file_io.available_files(app.config["SOUNDS"])})