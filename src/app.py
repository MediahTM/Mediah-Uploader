from api.webhook import Webhook
import api.cdn as cdn

hook = Webhook(url="https://discord.com/api/webhooks/1224099792335015936/mtKNdsa5rW49vCEBW2htgdJSeLZF2nr-Y2viblSM4zVYXfXn9Wd98GhzGzG6s9qWcNQl")

file = hook.send_file(r"C:\users\samue\Downloads\CTK\edit_dark.gif", "rb")

print(file)