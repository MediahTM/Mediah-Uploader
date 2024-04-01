import requests
import config
def strip_link(url: str) -> str:
    return str(url).split("?")[0].split("#")[0]

def renew_link(url: str) -> str:
    return requests.post("https://discord.com/api/v9/attachments/refresh-urls", json={"attachment_urls": [url]}, headers={"Authorization": config.DISCORD_TOKEN, "Content-Type": "application/json"}).json()["refreshed_urls"][0]["refreshed"]

def format_filesize(filesize: int) -> str:
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
    for size in sizes:
        if filesize / 1000 > 1:
            filesize /= 1000
        else:
            break
    return f"{round(filesize, 2)} {size}"