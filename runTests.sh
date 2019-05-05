#!/bin/bash
if [ "$1" == "--python" ] || [ "$1" == "--all" ]; then
    PATH=$PATH:../venv/Scripts
    (cd src && python -m unittest discover ../tests)
fi

if [ "$1" == "--nodejs" ] || [ "$1" == "--all" ]; then
    (cd frontend && CI=true npm test)
fi

if [ "$1" == "--nodejs-coverage" ]; then
    (cd frontend && CI=true npm coveralls)
fi