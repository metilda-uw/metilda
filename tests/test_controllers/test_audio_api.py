#rom metilda import get_app
import metilda
import tests

import tempfile 
import os
import io
import json
import pytest

#
# Test utility function in pitch_art_wizard
# TODO: Move to audio_utilities module?
#

#from metilda.controllers.pitch_art_wizard import allowed_file

def test_allowed_files_extensions():
    assert metilda.controllers.pitch_art_wizard.allowed_file("test.wav") == True
    assert metilda.controllers.pitch_art_wizard.allowed_file("test.mp3") == True
    assert metilda.controllers.pitch_art_wizard.allowed_file("test.mpeg") == True
    assert metilda.controllers.pitch_art_wizard.allowed_file("test.doc") == False

#
# Test Audio API calls in pitch_art_wizard
#
@pytest.fixture
def client():
    app = metilda.get_app()
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
    tests.testing_utilities.assert_images_equal("metilda/images-baseline/rs_kaanaisskiinaa-create.png", image)

def test_audio_upload(client):
    file_path = os.path.join(os.path.dirname(__file__),
                                 r"RS_kaanaisskiinaa.wav")
    rv = client.post("/api/upload/pitch/range?min-pitch=30.0&max-pitch=300.0", data={
    'file': open(file_path, 'rb')})
    result = {"pitches": [[0.27934240362811785, 127.22719743794082], [0.3043424036281179, 127.57927673041544], [0.3293424036281179, 130.68391182449415], [0.3543424036281179, 135.33594828836627], [0.3793424036281179, 143.16731379970082], [0.4043424036281179, 149.67564227726646], [0.4293424036281179, 154.27266322340697], [0.4543424036281179, 156.14500955863403], [0.4793424036281179, 152.69914178330873], [0.5043424036281179, 145.98092300376902], [0.5293424036281179, 138.2855553534943], [0.5543424036281178, 130.0362508774996], [0.5793424036281178, 123.07673348970123], [0.6043424036281179, 117.16844987695782], [0.6293424036281179, 108.15393863676503], [1.029342403628118, 115.18997814619615], [1.054342403628118, 111.95519063323188], [1.079342403628118, 108.29726474727966], [1.104342403628118, 105.2640469883573], [1.1293424036281179, 102.22069286178638], [1.154342403628118, 99.70017453694746], [1.179342403628118, 98.25854287200575], [1.204342403628118, 95.68506434730865], [1.229342403628118, 90.6439306585433], [1.254342403628118, 88.92748240116128], [1.279342403628118, 88.35507404779247], [1.304342403628118, 87.67907044221218], [1.329342403628118, 86.21920041522073], [1.354342403628118, 85.89994882729005], [1.379342403628118, 85.81400541350008], [1.404342403628118, 83.54450195980455]]}
    assert rv.content_type == "application/json"
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

def test_avg_pitch(client):
    rv = client.get("/api/audio/RS_kaanaisskiinaa.wav/pitch"
            "/avg?t0=1&t1=1.8586848072562359&max-pitch=500&min-pitch=75")
    result = {"avg_pitch": 94.64600351273972}
    assert rv.content_type == "application/json"
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

def test_all_audio_pitches(client): 
    rv = client.get("/api/audio/RS_kaanaisskiinaa.wav/pitch"
            "/range?max-pitch=500&min-pitch=75&t0=1&t1=1.8586848072562359")
    result = {"pitches":[[1.034342403628118, 115.38432386354027], [1.044342403628118, 114.67740398871781], [1.054342403628118, 112.70600324499854], [1.064342403628118, 110.36934190425784], [1.074342403628118, 108.64575148057386], [1.084342403628118, 107.23811690294671], [1.094342403628118, 106.3101461796791], [1.104342403628118, 105.16535083582029], [1.114342403628118, 104.11301475811433], [1.124342403628118, 102.50226292493262], [1.134342403628118, 100.96363325446201], [1.144342403628118, 100.1875685703155], [1.154342403628118, 99.46289875153407], [1.164342403628118, 98.91109106609096], [1.174342403628118, 98.53593120707515], [1.1843424036281178, 97.95376910770887], [1.1943424036281178, 97.00224497160939], [1.2043424036281178, 94.99064193879663], [1.2143424036281179, 93.00999592015272], [1.2243424036281179, 89.08883512212323], [1.2343424036281179, 88.91891635058438], [1.2443424036281179, 89.5089780250194], [1.2543424036281179, 88.84094214219965], [1.264342403628118, 88.60025464686701], [1.274342403628118, 88.41726432327481], [1.284342403628118, 88.1466444366155], [1.294342403628118, 88.28507348853273], [1.304342403628118, 87.93911468150384], [1.314342403628118, 86.81767689073106], [1.324342403628118, 85.4495076772113], [1.334342403628118, 85.58728751906467], [1.344342403628118, 87.17894651044212], [1.354342403628118, 85.26060883534437], [1.364342403628118, 85.54439480599198], [1.374342403628118, 86.40702879117572], [1.384342403628118, 86.15598706267649], [1.394342403628118, 84.83053616902212], [1.404342403628118, 83.33755899763639], [1.414342403628118, 82.28484921102729], [1.424342403628118, 90.42914235177568], [1.4343424036281178, 85.32710511218129]]}
    assert rv.content_type == "application/json"
    assert rv.status_code == 200
    assert result == json.loads(rv.data)

def test_all_upload_pitches(client):
    file_path = os.path.join(os.path.dirname(__file__),
                                 r"RS_kaanaisskiinaa.wav")
    rv = client.post("/api/upload/pitch/range?min-pitch=30.0&max-pitch=300.0", data={
    'file': open(file_path, 'rb')})
    #print(data.file.filename)
    result = {"pitches": [[0.27934240362811785, 127.22719743794082], [0.3043424036281179, 127.57927673041544], [0.3293424036281179, 130.68391182449415], [0.3543424036281179, 135.33594828836627], [0.3793424036281179, 143.16731379970082], [0.4043424036281179, 149.67564227726646], [0.4293424036281179, 154.27266322340697], [0.4543424036281179, 156.14500955863403], [0.4793424036281179, 152.69914178330873], [0.5043424036281179, 145.98092300376902], [0.5293424036281179, 138.2855553534943], [0.5543424036281178, 130.0362508774996], [0.5793424036281178, 123.07673348970123], [0.6043424036281179, 117.16844987695782], [0.6293424036281179, 108.15393863676503], [1.029342403628118, 115.18997814619615], [1.054342403628118, 111.95519063323188], [1.079342403628118, 108.29726474727966], [1.104342403628118, 105.2640469883573], [1.1293424036281179, 102.22069286178638], [1.154342403628118, 99.70017453694746], [1.179342403628118, 98.25854287200575], [1.204342403628118, 95.68506434730865], [1.229342403628118, 90.6439306585433], [1.254342403628118, 88.92748240116128], [1.279342403628118, 88.35507404779247], [1.304342403628118, 87.67907044221218], [1.329342403628118, 86.21920041522073], [1.354342403628118, 85.89994882729005], [1.379342403628118, 85.81400541350008], [1.404342403628118, 83.54450195980455]]}
    
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

