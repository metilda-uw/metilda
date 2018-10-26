from flask import Flask, jsonify, render_template
app = Flask(__name__,
            static_folder="../frontend/build/static",
            template_folder="../frontend/build")
import pitch_art_wizard_api


@app.route('/')
def homepage():
    return render_template("index.html")


def get_app():
    return app


if __name__ == "__main__":
    app.run()