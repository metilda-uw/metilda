from __future__ import absolute_import
import os

# Enable headless matplotlib
import matplotlib
matplotlib.use('Agg')

import decimal
from flask import Flask, render_template
from flask.json.provider import DefaultJSONProvider
from flask_compress import Compress
from flask_cors import CORS


class CustomJSONProvider(DefaultJSONProvider):
    """Flask 3.x: custom JSON provider for decimal.Decimal serialization."""

    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super().default(obj)


app = Flask(__name__,
            static_folder="../../frontend/build/static",
            template_folder="../../frontend/build")
app.config["SOUNDS"] = os.path.join(os.path.dirname(__file__), "sounds")
app.config["PICTURES"] = os.path.join(os.path.dirname(__file__), "pictures")
app.config["CERTIFICATES"] = os.path.join(os.path.dirname(__file__), "certificates")
app.config["SPECTROGRAMS"] = os.path.join(os.path.dirname(__file__), "saved_spectrograms")

app.json_provider_class = CustomJSONProvider
app.json = CustomJSONProvider(app)
Compress(app)
CORS(app)
import metilda.controllers.pitch_art_wizard
import metilda.controllers.mail
import metilda.controllers.controller_firestore

@app.route('/')
@app.route('/<path:path>')
def react_app(path=None):
    return render_template("index.html")


def get_app():
    return app