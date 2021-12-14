from __future__ import absolute_import
import os


def available_files(dir):
    return sorted(os.listdir(dir))