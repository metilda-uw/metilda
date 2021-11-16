################
#
#   There is a known issue with using flask's built-in server (i.e. this script)
#   and serving files to the user. See https://stackoverflow.com/q/37962925 for
#   more information.
#
#   When testing the site's audio functionality, you must instead launch the app
#   with a production server. See runLocalServer.sh
#
################


from __future__ import absolute_import
from metilda import get_app

if __name__ == "__main__":
    get_app().run()