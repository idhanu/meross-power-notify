from dotenv import load_dotenv
load_dotenv()

import asyncio
import os
from mail import send_email
from tracker import Tracker

from meross_iot.http_api import MerossHttpClient
from meross_iot.manager import MerossManager

EMAIL = os.environ.get('MEROSS_EMAIL')
PASSWORD = os.environ.get('MEROSS_PASSWORD')
TO_EMAILS = os.environ.get('TO_EMAILS').split(',')

RUNNING_DELAY = 180
STOPPED_DELAY = 1800
THRESHOLD = 100
THRESHOLD = 100

async def main():
    record = Tracker(sample_size=5, threshold=10,
                     running_detection_points=2, stopped_detection_points=5)

    # Setup the HTTP client API from user-password
    http_api_client = await MerossHttpClient.async_from_user_password(email=EMAIL, password=PASSWORD)

    # Setup and start the device manager
    manager = MerossManager(http_client=http_api_client)
    await manager.async_init()

    # Discover devices.
    await manager.async_device_discovery()
    plugs = manager.find_devices(device_name="Synology")

    if len(plugs) < 1:
        print("No electricity-capable device found...")
    else:
        plug = plugs[0]

        # Update device status: this is needed only the very first time we play with this device (or if the
        # connection goes down)
        await plug.async_update()

        delay = STOPPED_DELAY
        try:
            while(True):
                # Read the electricity power/voltage/current
                instant_consumption = await plug.async_get_instant_metrics()
                message = f"Power consumption is {instant_consumption.power}W"
                record.record(instant_consumption.power)
                print(record.samples[0])

                if instant_consumption.power > THRESHOLD: 
                    delay = RUNNING_DELAY

                if (record.turn_off_detected):
                    send_email("Washing cycle completed", message, TO_EMAILS)
                    print("Notified!")
                    delay = STOPPED_DELAY
                    record.clear()
                
                await asyncio.sleep(delay)
                
        finally:
            # Close the manager and logout from http_api
            print("\n\nClosing connection. Please wait...")
            manager.close()
            await http_api_client.async_logout()

try:
    asyncio.run(main())
except(KeyboardInterrupt):
    print("Completed")