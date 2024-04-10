from flask import Flask, request, render_template, send_file
import requests
import config

app = Flask(__name__)

def strip_link(url: str) -> str:
    return str(url).split("?")[0].split("#")[0]

def renew_link(url: str) -> str:
    return requests.post("https://discord.com/api/v9/attachments/refresh-urls", json={"attachment_urls": [url]}, headers={"Authorization": config.DISCORD_TOKEN, "Content-Type": "application/json", "User-Agent": config.USER_AGENT}).json()["refreshed_urls"][0]["refreshed"]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload")
def upload_page():
    return render_template("upload.html")

@app.route("/download")
def download_page():
    return render_template("download.html")

@app.route("/api/download/<path:url>", methods=["GET"])
def download(url):
    try:
        start = request.args.get("start")
        end = str(int(request.args.get("end"))-1)
        headers = {'Range': f'bytes={start}-{end}'}
        if start and end:
            response = requests.get(renew_link(url), headers=headers)
            if response.status_code == 206:
                return response.content
            else:
                return (f"Error: {response.status_code} - {response.reason}")
        else:
            return "Add start/end arguments!"
    except:
        return "Add start/end arguments!"

app.run(debug=True, port=80)