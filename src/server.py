import asyncio
from aiohttp import web
import logging
import os
import socket

def get_local_ip():
    try:
        # Create a socket to get the local IP address
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(('8.8.8.8', 80))  # Connecting to a public DNS server
            local_ip = s.getsockname()[0]
            return local_ip
    except socket.error:
        return "Could not retrieve local IP"


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
        last_n_lines = lines[-n:]
        return ''.join(last_n_lines)

async def dashboard(request):
    return web.Response(text=read_last_n_lines(logs_path, 50))
    
async def handler(request):
    return await dashboard(request)

PORT = 22000
async def run_server():
    logger.info('Starting server')
    server = web.Server(handler)
    runner = web.ServerRunner(server)
    await runner.setup()
    ip = get_local_ip()
    site = web.TCPSite(runner, ip, PORT)
    await site.start()

    logger.info(f"Server running on http://{ip}:{PORT}")

asyncio.run(run_server())