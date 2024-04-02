import os
from flask import Flask, request, render_template, send_file
from api.webhook import Webhook
from api import cdn
import io

app = Flask(__name__)
hook = Webhook(url="https://discord.com/api/webhooks/1224099792335015936/mtKNdsa5rW49vCEBW2htgdJSeLZF2nr-Y2viblSM4zVYXfXn9Wd98GhzGzG6s9qWcNQl")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/upload", methods=["GET", "POST"])
def upload():
    file = request.files["upload"]
    return hook.send_bytes(file_bytes=file.stream.read(), filename=file.filename)

@app.route("/api/download", methods=["GET", "POST"])
def download():
    data = request.files["download"]
    return cdn.download_links(data)

app.run(debug=True, port=80)