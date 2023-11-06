import asyncio
import json
from aiohttp import web
import logging
import os
import socket

from config import update_settings

def get_local_ip():
    ## getting the IP address using socket.gethostbyname() method
    return socket.gethostbyname("")


# Get the directory of the current file
current_file_path = os.path.realpath(__file__)
current_directory = os.path.dirname(current_file_path)

# Define the relative path to the file
relative_path = '../logs.log'

# Get the absolute path of the file relative to the current file
logs_path = os.path.abspath(os.path.join(current_directory, relative_path))
logger = logging.getLogger("SERVER")

def read_last_n_lines(file_path, n):
    with open(file_path, 'r') as file:
        lines = file.readlines()
        return lines[-n:]

async def updateSettingsHandler(request):
    data = await request.json()
    update_settings(data)
    logger.info(f"Updating settings with: {json.dumps(data, indent=2)}")
    return web.json_response({'success': True})
    
async def logsHandler(request):
    return web.json_response({'success': True, "logs":read_last_n_lines(logs_path, 50) })

async def dashboardHandler(request):
    file = os.path.join(current_directory, '../home-dashboard/dist' + ('/index.html' if request.path == '/' else request.path))
    return  web.FileResponse(file) if os.path.exists(file) else web.Response(status=404)


PORT = 22000

@web.middleware
async def cors_middleware(request, handler):
    if request.method == 'OPTIONS':
        # Respond to preflight requests immediately
        response = web.Response()
    else:
        response = await handler(request)
        
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


async def run_server():
    app = web.Application(middlewares=[cors_middleware])
    app.router.add_route('GET', '/api/logs', logsHandler)
    app.router.add_route('POST', '/api/settings', updateSettingsHandler)
    app.router.add_route('GET', '/{tail:.*}', dashboardHandler)

    logger.info('Starting server')
    runner = web.AppRunner(app)
    await runner.setup()
    ip = get_local_ip()
    site = web.TCPSite(runner, ip, PORT)
    await site.start()

    logger.info(f"Server running on http://{ip}:{PORT}")
    await asyncio.sleep(34343434)

asyncio.run(run_server())