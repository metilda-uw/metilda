import metilda.services.utils as utils
import tempfile 
import json
import pytest
from PIL import Image

def test_fileType():
    extension = utils.fileType("testFile.mpeg")
    assert extension == "mpeg"

def test_isSound():
    assert utils.isSound("testFiles.mpeg") == False
    assert utils.isSound("testFiles.txt") == False
    assert utils.isSound("testFiles.wav") == True
    assert utils.isSound("testFiles.mp3") == True

def test_resizeImage():
    temp = tempfile.tempdir
    image_original = Image.new(mode="RGB", size=(700, 700))
    image_name = ''.join([str(temp),"/image.png"])
    image_original.save(image_name, format="png")
    utils.resizeImage(image_name)
    image_resized = Image.open(image_name)
    width, height = image_resized.size
    assert width == 500
    assert height == 500