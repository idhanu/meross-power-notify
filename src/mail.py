import smtplib
from email.mime.text import MIMEText
import os

from config import GMAIL_APP_PASSWORD, GMAIL_SENDER

def send_email(subject, body, recipients):
    sender = GMAIL_SENDER
    password = GMAIL_APP_PASSWORD
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = ', '.join(recipients)
    smtp_server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    smtp_server.login(sender, password)
    smtp_server.sendmail(sender, recipients, msg.as_string())
    smtp_server.quit()
