from __future__ import absolute_import
from waitress import serve
import metilda
serve(metilda.get_app(), host='0.0.0.0', port=5000)
