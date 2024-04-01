import asyncio
import discord
import aiohttp
import io
import os
from api import cdn

class Webhook():
    def __init__(self, url: str):
        self.url = url
        
    def send_bytes(self, file_bytes: bytes, filename: str) -> str:
        return asyncio.run(self.asyncio_send_bytes(file_bytes, filename))
    
    async def asyncio_send_bytes(self, file_bytes: bytes, filename: str) -> str:
        async with aiohttp.ClientSession() as session:
            try:
                filesize = (len(file_bytes))
                print(cdn.format_filesize(filesize))
                webhook = discord.Webhook.from_url(self.url, session=session)
                file = discord.File(fp=io.BytesIO(file_bytes), filename=filename)
                message: discord.Message = await webhook.send(f"Uploaded file: {filename}", file=file, username='CLOUD', wait=True)
                return str(message.attachments[0])
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