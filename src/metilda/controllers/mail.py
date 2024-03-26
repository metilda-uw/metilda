from email.message import EmailMessage
import ssl
import smtplib
import os
from metilda import app
import flask
import uuid
import random
from flask import request, jsonify, send_file, flash
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

@app.route('/api/send-email', methods=["POST"])
def sendEmail():
    print(request.form['receivers'])
    print(request.form['message'])

    body= request.form['message']

    sender= 'noreply.metilda@gmail.com'
    receivers= request.form['receivers']
    # em = EmailMessage()
    em = MIMEMultipart('alternative')
    em['From'] = sender
    em['To'] = receivers
    em['Subject'] = request.form['subject']


    APP_PASSWORD = os.environ['GMAIL_APP_PASSWORD']
    if not APP_PASSWORD:
        return jsonify({'status': 400, 'isMessageSent': False})

    # em.set_content(body)
    em.attach(MIMEText(body, 'html'))

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL('smtp.gmail.com',465,context=context) as smtp:
        smtp.login(sender, APP_PASSWORD)
        # smtp.sendmail(sender,receiver,em.as_string())
        try:
            # Send the email
            # smtp.sendmail(sender, receiver, em.as_string())
            smtp.send_message(em)
            print("Email sent successfully!")
            return jsonify({'status': 200, 'isMessageSent': True})
        except smtplib.SMTPException as e:
            print("Error: Unable to send email:", str(e))
            return jsonify({'status': 400, 'isMessageSent': False})
        except Exception as e:
            print("Error: Unable to send email:", str(e))
            return jsonify({'status': 400, 'isMessageSent': False})
        finally:
            # Close the SMTP connection
            smtp.quit()

@app.route('/api/verify-email', methods=["POST"])
def verifyEmail():

    # Generate a random 6-digit number
    randomNumber = random.randint(100000, 999999)
    body= request.form['message']
    body = body + ' This is verification code: ' + str(randomNumber)

    sender= 'noreply.metilda@gmail.com'
    receiver= request.form['receiver']
    em = EmailMessage()
    em['From'] = sender
    em['To'] = receiver
    em['Subject'] = request.form['subject']


    APP_PASSWORD = os.environ['GMAIL_APP_PASSWORD']
    if not APP_PASSWORD:
        return jsonify({'status': 400, 'isMessageSent': False})

    em.set_content(body)

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL('smtp.gmail.com',465,context=context) as smtp:
        smtp.login(sender, APP_PASSWORD)
        # smtp.sendmail(sender,receiver,em.as_string())
        try:
            # Send the email
            smtp.sendmail(sender, receiver, em.as_string())
            print("Email sent successfully!")
            return jsonify({'status': 200, 'isMessageSent': True, 'verificationCode': randomNumber})
        except smtplib.SMTPException as e:
            print("Error: Unable to send email:", str(e))
            return jsonify({'status': 400, 'isMessageSent': False, 'verificationCode':-1})
        except Exception as e:
            print("Error: Unable to send email:", str(e))
            return jsonify({'status': 400, 'isMessageSent': False, 'verificationCode':-1})
        finally:
            # Close the SMTP connection
            smtp.quit()



