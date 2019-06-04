#!/bin/bash

if [ "$1" == "5" ]; then
    ./venv/Scripts/locust.exe --host http://localhost:5000  -f load_tests/controllers_test/pitch_art_wizard_test.py --no-web -c 5 -r 1 -t 1m --csv=output/5_user
    exit 0
fi

if [ "$1" == "50" ]; then
    ./venv/Scripts/locust.exe --host http://localhost:5000  -f load_tests/controllers_test/pitch_art_wizard_test.py --no-web -c 50 -r 10 -t 10m --csv=output/50_user
    exit 0
fi

if [ "$1" == "500" ]; then
    ./venv/Scripts/locust.exe --host http://localhost:5000  -f load_tests/controllers_test/pitch_art_wizard_test.py --no-web -c 500 -r 100 -t 10m --csv=output/500_user
    exit 0
fi

echo "USAGE: loadTests.sh [5 | 50 | 500]"
exit 1