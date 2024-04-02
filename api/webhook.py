import asyncio
import json
import math
import discord
import aiohttp
import io
import os
import config
from api import cdn
from flask import send_file
import base64

class Webhook():
    def __init__(self, url: str):
        self.url = url
        
    def send_bytes(self, file_bytes: bytes, filename: str) -> str:
        return asyncio.run(self.asyncio_send_bytes(file_bytes, filename))
    
    async def asyncio_send_bytes(self, file_bytes: bytes, filename: str) -> str:
        async with aiohttp.ClientSession() as session:
            try:
                filebasename = os.path.splitext(filename)[0]
                webhook = discord.Webhook.from_url(self.url, session=session)
                filesize = (len(file_bytes))
                messages = []
                parts_count = math.ceil(filesize / config.MAX_CHUNK_SIZE)
                for part in range(1, parts_count+1):
                    file = discord.File(fp=io.BytesIO(file_bytes[int(config.MAX_CHUNK_SIZE * (part-1)):int(config.MAX_CHUNK_SIZE * (part))]), filename=f"{base64.b64encode(filebasename.encode('utf-8')).decode('utf-8')[:56]}_{part}.txt")
                    message: discord.Message = await webhook.send(f"Uploaded file: {base64.b64encode(filebasename.encode('utf-8')).decode('utf-8')[:56]}_{part}.txt (Part {part}/{parts_count})", file=file, username='CLOUD', wait=True)
                    messages.append(cdn.strip_link(str(message.attachments[0])))
                json_to_send = {
                    "parts": messages,
                    "filename": filename,
                    "size": filesize
                }
                json_file = discord.File(fp=io.BytesIO(json.dumps(json_to_send, indent=4).encode()), filename=base64.b64encode(filebasename.encode('utf-8')).decode('utf-8')[:56]+".json")
                await webhook.send(content=f"{filename} has been fully uploaded using Mediah!", file=json_file, embed=discord.Embed(title="Download Mediah now and get unlimited storage!", url="https://github.com/MediahTM/Mediah-Local/", description="Mediah offers completely free unlimited cloud storage courtesy of Discord! We have a wide variety of music, movies and more all hosted using Discord avaliable for download!").set_image(url="https://avatars.githubusercontent.com/u/165603488?s=48&v=4"))
                return send_file(path_or_file=io.BytesIO(json.dumps(json_to_send, indent=4).encode()), download_name=base64.b64encode(filebasename.encode('utf-8')).decode('utf-8')[:56]+".json", as_attachment=True)
            except Exception as e:
                return (str(e))
    
    def send_file(self, file_path: str) -> str:
        return asyncio.run(self.asyncio_send_file(file_path))
    
    async def asyncio_send_file(self, file_path: str) -> str:
        async with aiohttp.ClientSession() as session:
            try:
                webhook = discord.Webhook.from_url(self.url, session=session)
                message: discord.Message = await webhook.send(f"Uploaded file: '{os.path.basename(file_path)}'", file=discord.File(file_path), username='CLOUD', wait=True)
                return str(message.attachments[0])
            except Exception as e:
                return (str(e))