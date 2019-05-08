#!/bin/bash
PATH=$PATH:../venv/Scripts
(cd ../src && python -m unittest discover ../tests)