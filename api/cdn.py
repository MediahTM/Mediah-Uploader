import base64
import io
import json
import requests
import config
from flask import send_file
from api import cdn

def strip_link(url: str) -> str:
    return str(url).split("?")[0].split("#")[0]

def renew_link(url: str) -> str:
    return requests.post("https://discord.com/api/v9/attachments/refresh-urls", json={"attachment_urls": [url]}, headers={"Authorization": config.DISCORD_TOKEN, "Content-Type": "application/json", "User-Agent": config.USER_AGENT}).json()["refreshed_urls"][0]["refreshed"]

def process_file_data(data: bytes) -> dict:
    try:
        lines = data.split(b"\n")
        filename = lines[1].split(b'filename="', 1)[1].decode("utf-8").strip()[:-1]
        file_bytes = b"\n".join(lines[4:-2])
        file_bytes = file_bytes[:-1]
        return {"filename": filename, "file_bytes": file_bytes}
    except:
        return None

def format_filesize(filesize: int) -> str:
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
    for size in sizes:
        if filesize / 1024 > 1:
            filesize /= 1024
        else:
            break
    return f"{round(filesize, 2)} {size}"

def download_links(data: str|dict|bytes):
    if type(data) == str:
        data = json.loads(data)
    elif type(data) == bytes:
        data = json.loads(data.decode())
    file = b""
    for chunk in data["parts"]:
        response = requests.get(cdn.renew_link(chunk))
        file += response.content
    return send_file(io.BytesIO(file), download_name=data["filename"], as_attachment=True)