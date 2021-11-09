import subprocess
from flask import Flask
from flask_cors import CORS

# Locations of required files
_images_dir = "images/"
_scripts_dir = "metilda/scripts/"
_sounds_dir = "sounds/"
_eaf_dir = "metilda/eaf/"
_linkElanPraat_dir = "combined/"

# Run script 'scriptName' with the provided parameters
def runScript(scriptName, args):
   praatExec = ["praat_nogui", "--run", "--no-pref-files", scriptName];
   praatExec.extend(args)
   #print "script is: " + str(praatExec)
   output = subprocess.check_output(praatExec);
   #print "output from praat.py is: " + str(output)
   return output

# Create flask app
app = Flask(__name__, static_url_path="")

# Add CORS headers to allow cross-origin requests
CORS(app)

#Import views
