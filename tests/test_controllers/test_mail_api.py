import pytest
import os
import smtplib
from flask import Flask
from metilda import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_smtp(monkeypatch):
    class MockSMTP:
        def __init__(self, *args, **kwargs):
            self.login_called_with = None
            self.send_message_called = False
            self.sendmail_called = False
            self.raise_smtp_exception = False
            self.raise_general_exception = False

        def login(self, username, password):
            self.login_called_with = (username, password)

        def send_message(self, msg):
            self.send_message_called = True
            if self.raise_smtp_exception:
                raise smtplib.SMTPException("Simulated SMTPException")
            if self.raise_general_exception:
                raise Exception("Simulated general exception")

        def sendmail(self, from_addr, to_addrs, msg):
            self.sendmail_called = True
            if self.raise_smtp_exception:
                raise smtplib.SMTPException("Simulated SMTPException")
            if self.raise_general_exception:
                raise Exception("Simulated general exception")


        def quit(self):
            pass

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            pass

    mock_smtp_instance = MockSMTP()
    monkeypatch.setattr(smtplib, 'SMTP_SSL', lambda *args, **kwargs: mock_smtp_instance)
    return mock_smtp_instance

def test_send_email_success(client, mock_smtp):
    os.environ['GMAIL_APP_PASSWORD'] = 'dummy_password'

    response = client.post('/api/send-email', data={
        'receivers': 'test@example.com',
        'message': 'Test Message',
        'subject': 'Test Subject'
    })

    assert response.status_code == 200
    assert response.json['status'] == 200
    assert response.json['isMessageSent'] == True

    assert mock_smtp.login_called_with == ('noreply.metilda@gmail.com', 'dummy_password')
    assert mock_smtp.send_message_called

def test_send_email_failure_no_password(client):
    if 'GMAIL_APP_PASSWORD' in os.environ:
        del os.environ['GMAIL_APP_PASSWORD']

    response = client.post('/api/send-email', data={
        'receivers': 'test@example.com',
        'message': 'Test Message',
        'subject': 'Test Subject'
    })

    assert response.status_code == 200
    assert response.json['status'] == 400
    assert response.json['isMessageSent'] == False

def test_send_email_smtp_exception(client, mock_smtp):
    os.environ['GMAIL_APP_PASSWORD'] = 'dummy_password'
    mock_smtp.raise_smtp_exception = True

    response = client.post('/api/send-email', data={
        'receivers': 'test@example.com',
        'message': 'Test Message',
        'subject': 'Test Subject'
    })

    assert response.status_code == 200
    assert response.json['status'] == 400
    assert response.json['isMessageSent'] == False

def test_send_email_general_exception(client, mock_smtp):
    os.environ['GMAIL_APP_PASSWORD'] = 'dummy_password'
    mock_smtp.raise_general_exception = True

    response = client.post('/api/send-email', data={
        'receivers': 'test@example.com',
        'message': 'Test Message',
        'subject': 'Test Subject'
    })

    assert response.status_code == 200
    assert response.json['status'] == 400
    assert response.json['isMessageSent'] == False

def test_verify_email_success(client, mock_smtp):
    os.environ['GMAIL_APP_PASSWORD'] = 'dummy_password'

    response = client.post('/api/verify-email', data={
        'receiver': 'test@example.com',
        'message': 'Test Message',
        'subject': 'Test Subject'
    })

    assert response.status_code == 200
    assert response.json['status'] == 200
    assert response.json['isMessageSent'] == True
    assert 'verificationCode' in response.json
    assert response.json['verificationCode'] != -1

    assert mock_smtp.login_called_with == ('noreply.metilda@gmail.com', 'dummy_password')
    assert mock_smtp.sendmail_called

def test_verify_email_failure_no_password(client):
    if 'GMAIL_APP_PASSWORD' in os.environ:
        del os.environ['GMAIL_APP_PASSWORD']

    response = client.post('/api/verify-email', data={
        'receiver': 'test@example.com',
        'message': 'Test Message',
        'subject': 'Test Subject'
    })

    assert response.status_code == 200
    assert response.json['status'] == 400
    assert response.json['isMessageSent'] == False
    assert response.json['verificationCode'] == -1

def test_verify_email_smtp_exception(client, mock_smtp):
    os.environ['GMAIL_APP_PASSWORD'] = 'dummy_password'
    mock_smtp.raise_smtp_exception = True

    response = client.post('/api/verify-email', data={
        'receiver': 'test@example.com',
        'message': 'Test Message',
        'subject': 'Test Subject'
    })

    assert response.status_code == 200
    assert response.json['status'] == 400
    assert response.json['isMessageSent'] == False
    assert response.json['verificationCode'] == -1

def test_verify_email_general_exception(client, mock_smtp):
    os.environ['GMAIL_APP_PASSWORD'] = 'dummy_password'
    mock_smtp.raise_general_exception = True

    response = client.post('/api/verify-email', data={
        'receiver': 'test@example.com',
        'message': 'Test Message',
        'subject': 'Test Subject'
    })

    assert response.status_code == 200
    assert response.json['status'] == 400
    assert response.json['isMessageSent'] == False
    assert response.json['verificationCode'] == -1
