from __future__ import absolute_import
from PIL import Image
import os, re

# Supported audio types.
# To add a format already supported by praat, just add the extension here
_sound_extensions = set(["wav", "mp3"])

def fileType(fileName):
   """ Return file extension """
   return fileName.rsplit('.', 1)[1]

def isSound(fileName):
   """ Checks if fileName has a valid sound file extension """
   return '.' in fileName and \
         fileType(fileName) in _sound_extensions

def resizeImage(image):
   """ Down-scaling the image to 500x500 pixels """
   img = Image.open(image)
   img.thumbnail((500,500), Image.ANTIALIAS)
   img.save(image, "PNG", quality=88)

def deleteCachedImages(directory, prefix):
   """ Delete cached images starting with prefix """
   pattern = "^" + prefix + ".*"
   for f in os.listdir(directory):
       if re.search(pattern, f):
           os.remove(os.path.join(directory, f))

