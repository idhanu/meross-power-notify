import asyncio
import json
from aiohttp import web
import logging
import os
import socket
from amber import Amber

from config import EV_SETTINGS
from meross_helpers import find_device
from neo_helpers import get_status

server_only = __name__ == "__main__"


def get_local_ip():
    ## getting the IP address using socket.gethostbyname() method
    return socket.gethostbyname("")


# Get the directory of the current file
current_file_path = os.path.realpath(__file__)
current_directory = os.path.dirname(current_file_path)

# Define the relative path to the file
relative_path = "../logs.log"

# Get the absolute path of the file relative to the current file
logs_path = os.path.abspath(os.path.join(current_directory, relative_path))
logger = logging.getLogger("SERVER")


def read_last_n_lines(file_path, n):
    with open(file_path, "r") as file:
        lines = file.readlines()
        return lines[-n:]


async def update_settings_handler(request):
    data = await request.json()
    EV_SETTINGS["manual_cutoff"] = data["manual_cutoff"]
    logger.info(f"Updating settings with: {json.dumps(data, indent=2)}")
    return web.json_response({"success": True})


async def logs_handler(request):
    return web.json_response(
        {"success": True, "logs": read_last_n_lines(logs_path, 50)}
    )


async def dashboard_handler(request):
    file = os.path.join(
        current_directory,
        "../home-dashboard/dist"
        + ("/index.html" if request.path == "/" else request.path),
    )
    return web.FileResponse(file) if os.path.exists(file) else web.Response(status=404)


async def meross_get_plug_handler(request):
    device = await find_device(request.query.get("name"))
    instant_consumption = await device.async_get_instant_metrics()
    logger.info(f"Returning instant consumption: {instant_consumption}")
    return web.json_response(
        {
            "success": True,
            "result": {
                "power": instant_consumption.power,
                "current": instant_consumption.current,
                "voltage": instant_consumption.voltage,
            },
        }
    )


async def meross_post_plug_handler(request):
    data = await request.json()
    device = await find_device(data["name"])
    if data["on"]:
        await device.async_turn_on(channel=0)
    else:
        await device.async_turn_off(channel=0)
    logger.info(f"Turning {data['name']} {'on' if data['on'] else 'off'}")
    return web.json_response(
        {
            "success": True,
            "result": {"on": data["on"]},
        }
    )


PORT = 22001


@web.middleware
async def cors_middleware(request, handler):
    if request.method == "OPTIONS":
        # Respond to preflight requests immediately
        response = web.Response()
    else:
        response = await handler(request)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Cache-Control"] = "no-cache"

    return response


async def get_ac_status(request):
    status = await get_status()
    return web.json_response(
        {
            "success": True,
            "result": status.dict(),
        }
    )


async def run_server():
    app = web.Application(middlewares=[cors_middleware])
    app.router.add_route("GET", "/api/logs", logs_handler)
    app.router.add_route("GET", "/api/meross/plug", meross_get_plug_handler)
    app.router.add_route("POST", "/api/meross/plug", meross_post_plug_handler)
    app.router.add_route("GET", "/api/ac/status", get_ac_status)

    app.router.add_route("GET", "/{tail:.*}", dashboard_handler)

    logger.info("Starting server")
    runner = web.AppRunner(app, access_log=None)
    await runner.setup()
    ip = get_local_ip()
    site = web.TCPSite(runner, ip, PORT)
    await site.start()

    logger.info(f"Server running on http://{ip}:{PORT}")

    while True:
        await asyncio.sleep(34343434)


if server_only:
    logging.basicConfig(level=logging.INFO)
    logger.info(f"Direct execution, running on http://{get_local_ip()}:{PORT}")
    asyncio.run(run_server())
