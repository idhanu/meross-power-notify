# To fix the "No module named 'pydantic'" error, run:
# pip install pydantic
import asyncio
from actron_neo_api import ActronNeoAPI
import json
from config import NEO_PAIRING_TOKEN, NEO_DEVICE_UNIQUE_ID

api = None

async def get_api():
    global api
    if api is None:
        api = ActronNeoAPI(pairing_token=NEO_PAIRING_TOKEN)
        await api.refresh_token()
    return api

async def get_status():
    api = await get_api()

    # Get the status object
    return api.state_manager.get_status(NEO_DEVICE_UNIQUE_ID.lower())


async def main():
    async with ActronNeoAPI(username=username, password=password) as api:
        # Authenticate
        # await api.request_pairing_token(
        #     device_name=device_name, device_unique_id=device_unique_id
        # )
        api = ActronNeoAPI(pairing_token=pairing_token)
        print(f"Save this pairing token for future use: {api.pairing_token}")
        await api.refresh_token()

        # Get systems and update status
        systems = await api.get_ac_systems()
        await api.update_status()

        # Get the status object
        serial = systems[0].get("serial")
        status = api.state_manager.get_status(serial)
        # Convert status object to JSON
        status_json = json.dumps(status, default=lambda o: o.__dict__, indent=4)

        settings = status.user_aircon_settings
        await settings.set_temperature(20.5)

        # Print the JSON to console
        print(status_json)

        # Write the JSON to a file
        with open("neo_status.json", "w") as file:
            file.write(status_json)

        print(f"Status data written to neo_status.json")

        await api.close()

        # Control your AC system using object-oriented methods
        # Through the AC system object
        # await status.ac_system.set_system_mode(mode="COOL")

        # Through the settings object
        # await status.user_aircon_settings.set_temperature(
        #     23.0
        # )  # Mode inferred automatically
        # await status.user_aircon_settings.set_fan_mode("HIGH")

        # Control zones directly
        # zone = status.remote_zone_info[0]
        # await zone.enable(is_enabled=True)
        # await zone.set_temperature(22.0)  # Mode inferred from parent AC unit


if __name__ == "__main__":
    asyncio.run(main())
