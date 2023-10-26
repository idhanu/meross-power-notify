import smtplib
from email.mime.text import MIMEText
import os

def send_email(subject, body, recipients):
    sender = os.environ.get('GMAIL_SENDER')
    password = os.environ.get('GMAIL_APP_PASSWORD')
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = ', '.join(recipients)
    smtp_server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    smtp_server.login(sender, password)
    smtp_server.sendmail(sender, recipients, msg.as_string())
    smtp_server.quit()
