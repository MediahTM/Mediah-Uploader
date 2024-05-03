from flask import Flask, request, render_template
import requests
import config
import json

with open("file_info.json","r") as json_file:
    file_info = json.loads(json_file.read())

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

@app.route("/api/download", methods=["GET"])
def download():
    try:
        url = request.args.get("url")
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
            return "start/end arguments required"
    except Exception as e:
        return f"Exception in download: {e}"

@app.route("/api/file_info", methods=["GET"])
def info_api():
    try:
        file_type = request.args.get("type")
        try:
            return file_info[file_type]
        except:
            return {"image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB9UlEQVR4nO3YsUkFURCF4Q21KavQsvQtZgaibcgTzIQdA0ErGKxB8DzBFXPNhHNn9j8wDfwfN7nTxBhjjDHGBtxuOZzMi/b17uP65mE9mrptXnQ2h9aKtwvdnT+ux1OnVQaZO6JUA7l5OfRGqQby8Pa53udnX5SKIPn+1RelKkh2RakMkh1RqoNkN5QOINkJpQtIdkHpBJIdULqBZHWUjiBZGaUrSFZF6QySFVG6g2Q1lC2AZCWUrYBkFZQtgWQFlK2B5OgoWwTJP1Aunj5O3R6bBcnfUBaduT3KgVw9H9bb1/+7yydA1mGPFyI/AiDyhwdE/tiAyB8YEPmjAjJAyADEHy8A8QcLQPyRAhB/mADEHyMGOL5O5EcARP7wgMgfGxD5AwMif1RABggZgPjjBSD+YAGIP1IA4g8TgPhjxADH14n8CIDIHx4Q+WMDIn9gQOSPCsgAIQMQf7wAxB8sAPFHCkD8YQIQf4wY4Pg6kR8BEPnDAyJ/bEDkDwyI/FEBGSBkAOKPF4D4gwUg/kgBiD9MAOKPEQMcXyfyIwAif3hA5I8NiPyBAZE/KiADhAxA/PECEH+wAMQfKQDxhwlA/DFigOPrRH4EQOQPD4j8sQGRPzAg8kcFZICQAYg/XjQF2S2Hk3nRntP+p4XbgzHGGGOMTb/sG3hAqs+uZ65xAAAAAElFTkSuQmCC", "type": "Unknown"}
    except:
        return "'type' argument required"

app.run(debug=True, host="0.0.0.0", port=6969)