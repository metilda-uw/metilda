from flask import Flask, jsonify, render_template
app = Flask(__name__,
            static_folder="../frontend/build/static",
            template_folder="../frontend/build")


@app.route('/')
def homepage():
    return render_template("index.html")


@app.route('/api/hello_world')
def hello_world():
    return jsonify({'hello': 'world'})


def get_app():
    return app


if __name__ == "__main__":
    app.run()