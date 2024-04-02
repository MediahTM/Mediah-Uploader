import io
import json
import requests
import config
from flask import send_file

def strip_link(url: str) -> str:
    return str(url).split("?")[0].split("#")[0]

def renew_link(url: str) -> str:
    return requests.post("https://discord.com/api/v9/attachments/refresh-urls", json={"attachment_urls": [url]}, headers={"Authorization": config.DISCORD_TOKEN, "Content-Type": "application/json"}).json()["refreshed_urls"][0]["refreshed"]

def format_filesize(filesize: int) -> str:
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
    for size in sizes:
        if filesize / 1024 > 1:
            filesize /= 1024
        else:
            break
    return f"{round(filesize, 2)} {size}"

def download_links(data):
    json_data = json.loads(data.read())
    file = b""
    for chunk in json_data["parts"]:
        response = requests.get(chunk)
        file += response.content
    return send_file(io.BytesIO(file), download_name=json_data["filename"], as_attachment=True)