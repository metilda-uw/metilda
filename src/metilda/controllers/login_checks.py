"""Login checks for the routes that change accounts and roles.

The website sends the signed-in user's Firebase ID token as "Authorization: Bearer <token>".
The token is verified against Google's public certificates, so no secret key is needed here.
"""
import inspect
import os
from functools import wraps

from flask import jsonify, request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from .Postgres import Postgres

FIREBASE_PROJECT_ID = os.environ.get('FIREBASE_PROJECT_ID', 'metilda-c5ed6')
ADMIN_ROLE = 'Admin'
CLOCK_SKEW_SECONDS = 10

# A token created a moment ago can look "used too early" if this server's clock is a little behind
# Google's. Newer google-auth versions accept an allowance for that; older ones do not.
_verify_options = {}
if 'clock_skew_in_seconds' in inspect.signature(id_token.verify_firebase_token).parameters:
    _verify_options['clock_skew_in_seconds'] = CLOCK_SKEW_SECONDS


def get_caller_email_exact():
    """Return the verified email of the signed-in caller exactly as Firebase reports it (the
    website uses this same value as the user id), or None when the Authorization header is
    missing or the token is not valid."""
    header = request.headers.get('Authorization', '')
    if not header.startswith('Bearer '):
        return None
    token = header[len('Bearer '):].strip()
    try:
        claims = id_token.verify_firebase_token(token, google_requests.Request(),
                                                audience=FIREBASE_PROJECT_ID, **_verify_options)
    except Exception as error:
        print('Login check failed: {}'.format(error))
        return None
    return claims.get('email') or None


def get_caller_email():
    """Return the verified, lower-case email of the signed-in caller, or None when the
    Authorization header is missing or the token is not valid."""
    email = get_caller_email_exact()
    return email.lower() if email else None


def is_admin(email):
    """True when the email has a verified Admin role. A database error counts as not admin."""
    with Postgres() as connection:
        rows = connection.execute_select_query(
            """ SELECT 1 FROM USER_ROLE WHERE LOWER(USER_ID) = %s AND USER_ROLE = %s AND VERIFIED = true """,
            (email.lower(), ADMIN_ROLE))
    return bool(rows)


def _refuse(status, message):
    return jsonify({'result': 'Error: ' + message}), status


def admin_required(view):
    """Only a signed-in user with a verified Admin role may call the route."""
    @wraps(view)
    def wrapper(*args, **kwargs):
        email = get_caller_email()
        if email is None:
            return _refuse(401, 'login required')
        if not is_admin(email):
            return _refuse(403, 'admin role required')
        return view(*args, **kwargs)
    return wrapper


def self_or_admin_required(form_field='user_id'):
    """The signed-in user may call the route for their own account (the account named in
    form_field), and an Admin may call it for anyone."""
    def decorator(view):
        @wraps(view)
        def wrapper(*args, **kwargs):
            email = get_caller_email()
            if email is None:
                return _refuse(401, 'login required')
            target = request.form.get(form_field, '').strip().lower()
            if email != target and not is_admin(email):
                return _refuse(403, 'you can only do this for your own account')
            return view(*args, **kwargs)
        return wrapper
    return decorator
