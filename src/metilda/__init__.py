import os

# Enable headless matplotlib
import matplotlib
matplotlib.use('Agg')


from flask import Flask, render_template

app = Flask(__name__,
            static_folder="../../frontend/build/static",
            template_folder="../../frontend/build")
app.config["SOUNDS"] = os.path.join(os.path.dirname(__file__), "sounds")
app.config["PICTURES"] = os.path.join(os.path.dirname(__file__), "pictures")

import metilda.controllers.pitch_art_wizard


@app.route('/')
@app.route('/<path:path>')
def react_app(path=None):
    return render_template("index.html")


def get_app():
    return app