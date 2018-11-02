# Launcher for local, debug runs
from main import get_app


if __name__ == '__main__':
    get_app().run(host="localhost", port=5000, debug=True)