#!/bin/bash
PATH=$PATH:../venv/Scripts
# add -v, -vv or -s for verbose output
(cd ../src && python -m pytest ../tests)