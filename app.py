import base64
import os
from flask import Flask, request, render_template, send_file
import requests
from api.webhook import Webhook
from api import cdn
import io

app = Flask(__name__)
hook = Webhook(url="https://discord.com/api/webhooks/1224099792335015936/mtKNdsa5rW49vCEBW2htgdJSeLZF2nr-Y2viblSM4zVYXfXn9Wd98GhzGzG6s9qWcNQl")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload")
def upload_page():
    return render_template("upload.html")

@app.route("/download")
def download_page():
    return render_template("download.html")

@app.route("/api/upload", methods=["GET", "POST"])
def upload():
    data = request.data
    data = cdn.process_file_data(data)
    return hook.send_bytes(file_bytes=base64.b64encode(data["file_bytes"]), filename=data["filename"])

@app.route("/api/download/<path:url>", methods=["GET"])
def download(url):
    try:
        start = request.args.get("start")
        end = str(int(request.args.get("end"))-1)
        headers = {'Range': f'bytes={start}-{end}'}
        if start and end:
            response = requests.get(cdn.renew_link(url), headers=headers)
            if response.status_code == 206:
                return response.content
            else:
                return (f"Error: {response.status_code} - {response.reason}")
        else:
            return "Add start/end arguments!"
    except:
        return "Add start/end arguments!"

app.run(debug=True, port=80)