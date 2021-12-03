from __future__ import absolute_import
import subprocess
#from flask import Flask
#from flask_cors import CORS
from os import environ

# Locations of required files - path needs to change based on whether you are working locally or deploying to Heroku
if environ.get('FLASK_ENV') == "development":
   _images_dir = "images/"
   _scripts_dir = "metilda/scripts/"
   _sounds_dir = "sounds/"
   _eaf_dir = "metilda/eaf/"
   _linkElanPraat_dir = "combined/"   
else:
   _images_dir = "src/metilda/images/"
   _scripts_dir = "src/metilda/scripts/"
   _sounds_dir = "sounds/"
   _eaf_dir = "src/metilda/eaf/"
   _linkElanPraat_dir = "combined/"

# Run script 'scriptName' with the provided parameters
def runScript(scriptName, args):
   praatExec = ["praat_nogui", "--run", "--no-pref-files", scriptName];
   praatExec.extend(args)
   #print "script is: " + str(praatExec)
   output = subprocess.check_output(praatExec);
   #print "output from praat.py is: " + str(output)
   #return output
   return output.decode("utf-8")

# Create flask app
#app = Flask(__name__, static_url_path="")

# Add CORS headers to allow cross-origin requests
#CORS(app)

#Import views
