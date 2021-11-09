import pytest
import numpy as np
from PIL import Image
import os


import metilda.services.praat as praat
from tests.testing_utilities import assert_images_equal

def test_praat_run_script_get_bounds():
    script = praat._scripts_dir + "getBounds"
    sound="RS_kaanaisskiinaa.wav"
    output = praat.runScript(script, [sound, praat._sounds_dir])
    assert output == '0 seconds\n1.8586848072562359 seconds\n-0.411102294921875 Pascal\n0.5992431640625 Pascal\n'

def test_praat_run_script_draw_spectogram():
    upload_id="RS_kaanaisskiinaa.wav"
    script = praat._scripts_dir + "getBounds"
    output = praat.runScript(script, [upload_id, praat._sounds_dir])
    res = output.split()  # Split output into an array
    script = praat._scripts_dir + "drawSpectrogram"
    
    # Create Parameters to the script
    showSpectrogram="1" 
    showPitch="1"
    showIntensity="1"
    showFormants="1"
    showPulses="1"
    
    #file name, start time, stop time, show each of the parameters, sound dir, image dir.
    params = [upload_id, str(float(res[0])), str(float(res[2])),
             showSpectrogram, showPitch, showIntensity, showFormants, showPulses,
              praat._sounds_dir, praat._images_dir]

    # Image name will be a combination of relevant params joined by a period.
    image = 'metilda/' + praat._images_dir + ".".join(params[:-2]) + ".png"

    # Add image name to params list
    params.append(praat._images_dir + ".".join(params[:-2]) + ".png")
    
    praat.runScript(script, params)

    assert_images_equal("metilda/images-baseline/RS_kaanaisskiinaa.wav.0.0.1.85868480726.1.1.1.1.1-original.png", image)

def test_praat_run_script_get_energy():
    script = praat._scripts_dir + "getEnergy"
    sound="RS_kaanaisskiinaa.wav"
    output = praat.runScript(script, [sound, praat._sounds_dir])
    assert output == '0.003614359341019051 Pa2 sec\n'

