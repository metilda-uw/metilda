#!/usr/bin/env bash

PYTHONPATH="$PYTHONPATH;/venv/Lib;/venv/Lib/site-packages;/venv/Scripts;src" ./venv/Scripts/waitress-serve.exe --port=5000 --call metilda:get_app
