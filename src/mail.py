import smtplib
from email.mime.text import MIMEText
import os

SENDER = os.environ.get('GMAIL_SENDER')
PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')

def send_email(subject, body, recipients):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = SENDER
    msg['To'] = ', '.join(recipients)
    smtp_server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    smtp_server.login(SENDER, PASSWORD)
    smtp_server.sendmail(SENDER, recipients, msg.as_string())
    smtp_server.quit()
