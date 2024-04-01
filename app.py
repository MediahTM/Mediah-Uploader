import os
from flask import Flask, request, render_template
from api.webhook import Webhook

app = Flask(__name__)
hook = Webhook(url="https://discord.com/api/webhooks/1224099792335015936/mtKNdsa5rW49vCEBW2htgdJSeLZF2nr-Y2viblSM4zVYXfXn9Wd98GhzGzG6s9qWcNQl")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/upload", methods=["GET", "POST"])
def upload():
    file = request.files["file"]
    return hook.send_bytes(file_bytes=file.stream.read(), filename=os.path.splitext(file.filename)[0])

app.run(debug=True, port=80)