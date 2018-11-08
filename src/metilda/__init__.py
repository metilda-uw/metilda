import os

# Enable headless matplotlib
import matplotlib
matplotlib.use('Agg')


from flask import Flask, render_template

app = Flask(__name__,
            static_folder="../../frontend/build/static",
            template_folder="../../frontend/build")
app.config["SOUNDS"] = os.path.join(os.path.dirname(__file__), "sounds")

import metilda.controllers.pitch_art_wizard

@app.route('/')
def homepage():
    return render_template("index.html")


def get_app():
    return app