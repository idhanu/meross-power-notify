import os
import requests
import logging
import json
from datetime import datetime, timedelta


# Get the API key from the environment variable

# Set the base API endpoint URL
AMBER_BASE_URL = "https://api.amber.com.au/v1"
# Define the specific endpoint for prices
SITES_ENDPOINT = "/sites/01FWZA56KHW0TTQNA8478MT5J1/prices/current?resolution=30&next=48"

logger = logging.getLogger("AMBER")

class Amber:
    def get_cutoff(self):
        # Get the current time
        current_time = datetime.now()

        # Calculate the time for today's 3 PM
        three_pm_today = current_time.replace(hour=15, minute=0, second=0, microsecond=0)
        return three_pm_today + timedelta(days=1) if current_time >= three_pm_today else three_pm_today

    def format_time(self, time):
        return datetime.strptime(time, "%Y-%m-%dT%H:%M:%SZ")

    def get_upcoming_rates(self):
        # Construct the complete URL
        url = f"{AMBER_BASE_URL}{SITES_ENDPOINT}"

        # Define headers with authorization
        amberApiKey = os.environ.get("AMBER_API_KEY")
        headers = {
            "Authorization": f"Bearer {amberApiKey}",
            "accept": "application/json",
        }

        try:
            # Make the GET request with headers
            response = requests.get(url, headers=headers)

            # Check if the request was successful (HTTP status code 200)
            if response.status_code == 200:
                # Parse the JSON response
                return response.json()

            else:
                raise Exception(f"Request failed with status code: {response.status_code} {response.text}")

        except requests.exceptions.RequestException as e:
            logger.error(f"An error occurred: {e}")

    def should_charge_ev(self, amber_prices, threshold = 5):
        current_interval = next((item for item in amber_prices if item["type"] == "CurrentInterval"), None)
        
        if (current_interval is None):
            logger.error("Current interval not found")
            return False
        
        current_interval_descriptor = current_interval['descriptor']
        
        if (current_interval_descriptor == 'extremelyLow'):
            logger.info("Charge now because rates are extremely low")
            return True

        upcomingPrices = {}
        next_cutoff = self.get_cutoff()
        logger.info(f"Next cutoff is {next_cutoff}")

        for element in amber_prices:
            if element["type"] == "ForecastInterval" and self.format_time(element["endTime"]) <= next_cutoff:
                if element['descriptor'] not in upcomingPrices:
                    upcomingPrices[element['descriptor']] = 0
                upcomingPrices[element['descriptor']] += 1

        logger.info(f"Current price is {current_interval_descriptor}. Need to look at future prices until {next_cutoff}: {json.dumps(upcomingPrices, indent=2)}")
        

        if current_interval_descriptor == 'veryLow':
            if upcomingPrices.get('extremelyLow', 0) < threshold:
                logger.info("Charge now because rates are very low but not enough upcoming rates to be extremely low")
                return True
            else:
                logger.info(f"Future prices doesn't make sense charge at very low")
        
        
        if current_interval_descriptor == 'low': 
            if upcomingPrices.get('veryLow', 0) + upcomingPrices.get('extremelyLow', 0) < threshold:
                logger.info("Charge now because rates are low but not enough upcoming rates to be veryLow or extremely low")
                return True
            else:
                logger.info(f"Future prices doesn't make sense charge at low")

        return False
