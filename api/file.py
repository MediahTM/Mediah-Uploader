import requests
import os

def split(file_path: str) -> list:
    chunk_size = 10 * 1024 * 1024
    if os.path.getsize(file_path) > (5 * 1024 * 1024):
        with open(file_path, "r") as file:
            response = requests.get("https://cdn.gilcdn.com/ContentMediaGenericFiles/3a8df0a564e2b356209c67803fe2bf22-Full.mp4", stream=True, headers={'Range': f'bytes=0-{chunk_size-1}'})
            print(response.content)