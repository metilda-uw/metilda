from flask import Flask, jsonify
app = Flask(__name__)


@app.route('/hello_world')
def hello_world():
    return jsonify({'hello': 'world'})


def run_app():
    app.run()
    return app


if __name__ == "__main__":
    run_app()