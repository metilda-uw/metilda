#!/bin/bash
PATH=$PATH:../venv/Scripts
# add -v:  Gives a verbose output for each test, i.e. ../tests/test_controllers/test_audio_api.py::test_allowed_files_extensions PASSED                    [  1%] 
# add -vv: Gives additional details for failed test. 
# add -s: Prints output in-line while running tests
(cd ../src && python -m pytest -vv -s ../tests)