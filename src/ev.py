import json
import logging
from config import SETTINGS
from meross_helpers import find_device
import asyncio
from amber import Amber
from mocks.mock_amber_data import amber_values_actual

import datetime

logger = logging.getLogger('EV')

async def ev_monitor(manager):
    amber = Amber()
    plug = await find_device(manager, "EV")
    while (True):
        while (True):
            try: 
                data = amber.get_upcoming_rates()
                break
            except:
                logger.error("Could not get upcoming rates from Amber, trying again in 5 minutes")
                await asyncio.sleep(300)

        should_charge = amber.should_charge_ev(data, threshold=SETTINGS['evChargingThreshold'])
        logger.info(f"Charge threshold: {SETTINGS['evChargingThreshold']}")
        logger.info(f"Should charge: {should_charge}")

        if should_charge:
            logger.info("Turn on EV charging")
            await plug.async_turn_on(channel=0)
        else:
            logger.info("Turn off EV charging")
            await plug.async_turn_off(channel=0)

        current_time = datetime.datetime.now()
        wait = 60 - current_time.minute
        if wait > 30:
            wait -= 30

        logger.info(f"Wait for {wait} minutes until next check")
        await asyncio.sleep(wait * 60 + 30)

