import os
from dotenv import load_dotenv
load_dotenv()

AMBER_API_KEY = os.environ.get("AMBER_API_KEY")
GMAIL_SENDER = os.environ.get('GMAIL_SENDER')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')
MEROSS_EMAIL = os.environ.get('MEROSS_EMAIL')
MEROSS_PASSWORD = os.environ.get('MEROSS_PASSWORD')
TO_EMAILS = os.environ.get('TO_EMAILS')

EV_SETTINGS = {
    'ev': 12
}

# NEO API
NEO_DEVICE_NAME = os.environ.get("NEO_DEVICE_NAME")
NEO_DEVICE_UNIQUE_ID = os.environ.get("NEO_DEVICE_UNIQUE_ID")
NEO_USERNAME = os.environ.get("NEO_USERNAME")
NEO_PASSWORD = os.environ.get("NEO_PASSWORD")
NEO_PAIRING_TOKEN = os.environ.get("NEO_PAIRING_TOKEN")
