from __future__ import absolute_import
import os

# Enable headless matplotlib
import matplotlib
matplotlib.use('Agg')

import decimal
from flask import Flask, render_template, send_from_directory, abort
from flask.json.provider import DefaultJSONProvider
from flask_compress import Compress
from flask_cors import CORS
from werkzeug.security import safe_join


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
    if path:
        build_dir = os.path.abspath(
            os.path.join(app.root_path, app.template_folder)
        )

        # Serve existing public build files.
        safe_path = safe_join(build_dir, path)
        if safe_path and os.path.isfile(safe_path):
            return send_from_directory(build_dir, path)

        # Missing requests that look like static assets
        # should not fall back to React.
        asset_extensions = {
            ".js", ".css", ".json", ".ico", ".png",
            ".jpg", ".jpeg", ".svg", ".webp",
            ".woff", ".woff2", ".ttf", ".map",
        }

        if path.startswith("static/") or os.path.splitext(path)[1].lower() in asset_extensions:
            abort(404)

    # Allow React to handle client-side routes.
    return render_template("index.html")


def get_app():
    return app