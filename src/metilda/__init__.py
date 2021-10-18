import os

# Enable headless matplotlib
import matplotlib
matplotlib.use('Agg')

import decimal
from flask import Flask, render_template, json

class CustomJSONEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            # Convert decimal objects into strings
            return float(obj)

        return super(CustomJSONEncoder, self).default(obj)


app = Flask(__name__,
            static_folder="../../frontend/build/static",
            template_folder="../../frontend/build")
app.config["SOUNDS"] = os.path.join(os.path.dirname(__file__), "sounds")
app.config["PICTURES"] = os.path.join(os.path.dirname(__file__), "pictures")
app.config["CERTIFICATES"] = os.path.join(os.path.dirname(__file__), "certificates")

app.json_encoder = CustomJSONEncoder

import metilda.controllers.pitch_art_wizard

@app.route('/')
@app.route('/<path:path>')
def react_app(path=None):
    return render_template("index.html")

@app.route('/api')
def return_api():
    return "Hello!"


def get_app():
    return app