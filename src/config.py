import os
from dotenv import load_dotenv
load_dotenv()

AMBER_API_KEY = os.environ.get("AMBER_API_KEY")
GMAIL_SENDER = os.environ.get('GMAIL_SENDER')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')
MEROSS_EMAIL = os.environ.get('MEROSS_EMAIL')
MEROSS_PASSWORD = os.environ.get('MEROSS_PASSWORD')
TO_EMAILS = os.environ.get('TO_EMAILS')