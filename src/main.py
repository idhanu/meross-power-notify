import logging

# Configure the logging settings
logging.basicConfig(
    level=logging.INFO,  # Set the desired logging level
    format="%(asctime)s [%(name)s] %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",  # Define the timestamp format
)

from server import run_server
import asyncio
from time import sleep

from meross_helpers import get_meross
# from neo_helpers import get_api


logger = logging.getLogger("MAIN")


async def main():
    manager, http_api_client = await get_meross()
    # api = await get_api()

    try:
        await asyncio.gather(run_server())
    finally:
        # Close the manager and logout from http_api
        logger.info("\n\nClosing connection. Please wait...")
        manager.close()
        # await api.close()
        await http_api_client.async_logout()


while True:
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Completed")
        break
    except:
        logger.exception("")
        logger.info("Above exception occurred - waiting 60 seconds and continuing")
        sleep(60)
