#!/bin/bash
set -e
scriptdir="$(dirname "$0")"
cd "$scriptdir"

if [ "$1" == "--python" ] || [ "$1" == "--all" ]; then
    bash ./tests/python_tests.sh
fi

if [ "$1" == "--nodejs" ] || [ "$1" == "--all" ]; then
    bash ./tests/nodejs_tests.sh
fi

if [ "$1" == "--nodejs-coverage" ]; then
    bash ./tests/nodejs_coverage.sh
fi