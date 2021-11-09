from metilda import get_app
from tests.testing_utilities import assert_images_equal

import tempfile 
import os
import io
import json
import pytest

#
# Test utility function in pitch_art_wizard
# TODO: Move to audio_utilities module?
#
from metilda.controllers.pitch_art_wizard import allowed_file

def test_allowed_files_extensions():
    assert allowed_file("test.wav") == True
    assert allowed_file("test.mp3") == True
    assert allowed_file("test.mpeg") == True
    assert allowed_file("test.doc") == False

#
# Test Audio API calls in pitch_art_wizard
#
@pytest.fixture
def client():
    app = get_app()
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client

def test_api(client):
    rv = client.get('/api')
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    assert b'"version":"1.0"' in rv.data

def test_audio_analysis_image(client):
    rv = client.get('/api/audio/RS_kaanaisskiinaa.wav.png/image?min-pitch=75&max-pitch=500')
    image = io.BytesIO(rv.data)
    assert rv.status_code == 200
    assert rv.content_type == "image/png"
    assert_images_equal("metilda/images-baseline/rs_kaanaisskiinaa-create.png", image)

def test_audio_upload(client):
    file_path = os.path.join(os.path.dirname(__file__),
                                 r"RS_kaanaisskiinaa.wav")
    rv = client.post("/api/upload/pitch/range?min-pitch=30.0&max-pitch=300.0", data={
    'file': open(file_path, 'rb')})
    result = {"pitches": [[0.27934240362811785, 127.22719743794082], [0.3043424036281179, 127.57927673035603], [0.3293424036281179, 130.6839118242407], [0.3543424036281179, 135.33594828836627], [0.3793424036281179, 143.16731379977776], [0.4043424036281179, 149.67564227726623], [0.4293424036281179, 154.27266322340697], [0.4543424036281179, 156.14500955863426], [0.4793424036281179, 152.69914178330873], [0.5043424036281179, 145.98092300403582], [0.5293424036281179, 138.28555535370194], [0.5543424036281178, 130.0362508774996], [0.5793424036281178, 123.07673348970123], [0.6043424036281179, 117.16844987695796], [0.6293424036281179, 108.15393863676503], [1.029342403628118, 115.18997814593551], [1.054342403628118, 111.95519063269913], [1.079342403628118, 108.29726474683387], [1.104342403628118, 105.2640469883573], [1.1293424036281179, 102.22069286171504], [1.154342403628118, 99.7001745362314], [1.179342403628118, 98.25854287193297], [1.204342403628118, 95.68506434627695], [1.229342403628118, 90.64393065827777], [1.254342403628118, 88.92748240116056], [1.279342403628118, 88.355074048303], [1.304342403628118, 87.6790704421853], [1.329342403628118, 86.21920041532299], [1.354342403628118, 85.89994882728989], [1.379342403628118, 85.81400541350008], [1.404342403628118, 83.54450195977662]]}
    assert rv.content_type == "application/json"
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

def test_avg_pitch(client):
    rv = client.get("/api/audio/RS_kaanaisskiinaa.wav/pitch"
            "/avg?t0=1&t1=1.8586848072562359&max-pitch=500&min-pitch=75")
    result = {"avg_pitch": 94.64600351236169}
    assert rv.content_type == "application/json"
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

def test_all_audio_pitches(client): 
    rv = client.get("/api/audio/RS_kaanaisskiinaa.wav/pitch"
            "/range?max-pitch=500&min-pitch=75&t0=1&t1=1.8586848072562359")
    result = {"pitches":[[1.034342403628118, 115.38432386351262], [1.044342403628118, 114.67740398848444], [1.054342403628118, 112.70600324503464], [1.064342403628118, 110.36934190428823], [1.074342403628118, 108.64575148057386], [1.084342403628118, 107.23811690299539], [1.094342403628118, 106.31014617966069], [1.104342403628118, 105.16535083582035], [1.114342403628118, 104.11301475738809], [1.124342403628118, 102.50226292491696], [1.134342403628118, 100.96363325446175], [1.144342403628118, 100.18756857031505], [1.154342403628118, 99.46289874325504], [1.164342403628118, 98.91109106606957], [1.174342403628118, 98.5359312069565], [1.1843424036281178, 97.95376910792757], [1.1943424036281178, 97.00224496852351], [1.2043424036281178, 94.99064193916722], [1.2143424036281179, 93.00999592015249], [1.2243424036281179, 89.08883512211546], [1.2343424036281179, 88.91891635064414], [1.2443424036281179, 89.50897802501936], [1.2543424036281179, 88.84094214178428], [1.264342403628118, 88.60025464689761], [1.274342403628118, 88.41726432327481], [1.284342403628118, 88.14664443293734], [1.294342403628118, 88.28507348851446], [1.304342403628118, 87.93911468137502], [1.314342403628118, 86.81767689074233], [1.324342403628118, 85.44950767732819], [1.334342403628118, 85.58728751895372], [1.344342403628118, 87.17894651102065], [1.354342403628118, 85.26060883525562], [1.364342403628118, 85.54439480600163], [1.374342403628118, 86.40702879115862], [1.384342403628118, 86.15598706267649], [1.394342403628118, 84.83053616901111], [1.404342403628118, 83.33755899764037], [1.414342403628118, 82.28484921101294], [1.424342403628118, 90.42914235177568], [1.4343424036281178, 85.32710511218554]]}
    assert rv.content_type == "application/json"
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

def test_all_upload_pitches(client):
    file_path = os.path.join(os.path.dirname(__file__),
                                 r"RS_kaanaisskiinaa.wav")
    rv = client.post("/api/upload/pitch/range?min-pitch=30.0&max-pitch=300.0", data={
    'file': open(file_path, 'rb')})
    #print(data.file.filename)
    result = {"pitches": [[0.27934240362811785, 127.22719743794082], [0.3043424036281179, 127.57927673035603], [0.3293424036281179, 130.6839118242407], [0.3543424036281179, 135.33594828836627], [0.3793424036281179, 143.16731379977776], [0.4043424036281179, 149.67564227726623], [0.4293424036281179, 154.27266322340697], [0.4543424036281179, 156.14500955863426], [0.4793424036281179, 152.69914178330873], [0.5043424036281179, 145.98092300403582], [0.5293424036281179, 138.28555535370194], [0.5543424036281178, 130.0362508774996], [0.5793424036281178, 123.07673348970123], [0.6043424036281179, 117.16844987695796], [0.6293424036281179, 108.15393863676503], [1.029342403628118, 115.18997814593551], [1.054342403628118, 111.95519063269913], [1.079342403628118, 108.29726474683387], [1.104342403628118, 105.2640469883573], [1.1293424036281179, 102.22069286171504], [1.154342403628118, 99.7001745362314], [1.179342403628118, 98.25854287193297], [1.204342403628118, 95.68506434627695], [1.229342403628118, 90.64393065827777], [1.254342403628118, 88.92748240116056], [1.279342403628118, 88.355074048303], [1.304342403628118, 87.6790704421853], [1.329342403628118, 86.21920041532299], [1.354342403628118, 85.89994882728989], [1.379342403628118, 85.81400541350008], [1.404342403628118, 83.54450195977662]]}    
    
    assert rv.content_type == "application/json"
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

def test_sound_length(client):
    rv = client.get("/api/audio/RS_kaanaisskiinaa.wav/duration")
    result = {"duration": 1.8586848072562359 }
    assert rv.content_type == "application/json"
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

def test_download_file_1(client):
    file_path = os.path.join(os.path.dirname(__file__),
                                 r"test.wav")
    rv = client.post("/api/audio/download-file", data={
    'file': open(file_path, 'rb')})
    #print(data.file.filename)
    result = {"result":"success"}
    assert rv.content_type == "application/json"
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

@pytest.mark.skip(reason="how to test for a blank filename")
def test_download_file_2(client):
    file_path = os.path.join(os.path.dirname(__file__),
                                 r"test.wav")
    rv = client.post("/api/audio/download-file", data={
    'file': open(file_path, 'rb')})
    result = {"result":"success"}
    #assert rv.content_type == "application/json"
    #print(rv.data)
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

def test_available_files(client):
    rv = client.get('/api/audio')
    response_body = rv.json
    files = response_body["ids"]
    assert rv.status_code == 200
    assert rv.content_type == "application/json"
    assert len(files) == 5

