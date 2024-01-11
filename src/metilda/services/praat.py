from metilda import app
import subprocess
#from flask import Flask
#from flask_cors import CORS
import os
from os import environ

# Locations of required files - path needs to change based on whether you are working locally or deploying to Heroku
print("**** FLASK_ENV Variable ****** ",environ.get('FLASK_ENV'))
if environ.get('FLASK_ENV') == "development" or environ.get('FLASK_ENV') is None:
   #relative to metilda
   _images_dir = "images/"
   #relative to src
   _scripts_dir = "metilda/scripts/"
   _sounds_dir = "sounds/"
   _eaf_dir = "metilda/eaf/"
   _linkElanPraat_dir = "combined/"   
else:
   _images_dir = "images/"
   _scripts_dir = "src/metilda/scripts/"
   _sounds_dir = "sounds/"
   _eaf_dir = "src/metilda/eaf/"
   _linkElanPraat_dir = "combined/"

# Run script 'scriptName' with the provided parameters
def runScript(scriptName, args):
   app.logger.debug("Praat - Execute Script: " + scriptName)
   app.logger.debug("With args: ")
   app.logger.debug(args)
   
   praatExec = ["praat_nogui", "--run", "--no-pref-files", scriptName];
   praatExec.extend(args)
   output = subprocess.check_output(praatExec);
   
   app.logger.debug("Praat - Executed Script: " + scriptName)
   app.logger.debug("With output: ")
   app.logger.debug(output)

   return output.decode("utf-8")

# Create flask app
#app = Flask(__name__, static_url_path="")

# Add CORS headers to allow cross-origin requests
#CORS(app)

#Import views
