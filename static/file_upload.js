var file = ""
function dragOverHandler(ev) {
    ev.preventDefault();
}
function dropHandler(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item, i) => {
        if (item.kind === "file") {
            file = item.getAsFile();
            console.log(file)
            hideBrowse()
        }
        });
    }
}
function processFile() {
    const chunkSize = 16 * 1024 * 1024;
    const chunks = Math.ceil(file.size / chunkSize)
    let offset = 0;
    base64basename = btoa(file.name.substring(0, file.name.lastIndexOf('.'))).slice(0, 56)
    i = 0
    updateProgressBar(1)
    const reader = new FileReader();
    attachement_urls = []
    reader.onload = async function() {
        i += 1
        const fileName = base64basename + "_" + String(i) +".txt"
        try {
            await upload(arrayBufferToBase64(reader.result), fileName, chunks, i).then(url => {
                attachement_urls.push(url);
            })
        }catch(error){
                if (String(error).includes("NetworkError")) {
                    notification('Request blocked!', 'It looks like our request to Discord was blocked by a third party! Check out our troubleshooting guide at:', `https://github.com/MediahTM/Mediah-Uploader/blob/main/guide/troubleshooting.md`);
                }else{
                    console.log(error)
                }
                return
        }
        progress += (i / chunks) * 100
        updateProgressBar(progress)
        if (offset < file.size) {
            readNextChunk();
        }else{
            console.log(attachement_urls)
            const encoder = new TextEncoder()
            const data = encoder.encode(JSON.stringify({parts: attachement_urls, filename: file.name, uploaded_size: file.size}))
            downloadFile(data, base64basename + ".json", "application/octet-stream")
        }
    };
  
    function readNextChunk() {
        const blob = file.slice(offset, offset + chunkSize);
        reader.readAsArrayBuffer(blob);
        offset += chunkSize;
    }
  
    readNextChunk();
  }

async function upload(chunk, fileName, chunks, currentChunk) {
    progress = 0
    const formData = new FormData();
    formData.append('payload_json', JSON.stringify({content: `Uploaded file: ${fileName} (Part ${currentChunk}/${chunks})`,}));
    formData.append("file[0]", new Blob([(chunk)]), fileName);
    const response = await fetch("https://discord.com/api/webhooks/1224099792335015936/mtKNdsa5rW49vCEBW2htgdJSeLZF2nr-Y2viblSM4zVYXfXn9Wd98GhzGzG6s9qWcNQl", {"method": "POST", "body": formData});
    if (response.ok) {
        const responseText = await response.text();
        const attachment_url = JSON.parse(responseText)["attachments"][0]["url"];
        console.log(attachment_url);
        return attachment_url
    }
}
document.getElementById('browse').addEventListener('change', function() {
    file = this.files[0];
    if (file) {
        hideBrowse();
    } else {
        unhideBrowse();
    }
});
document.getElementById('fileEditButton').addEventListener('change', function() {
    file = this.files[0];
    if (file) {
        hideBrowse();
    } else {
        unhideBrowse();
    }
});
function downloadFile(bytes, fileName, mimeType) {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
function hideBrowse() {
    document.getElementById("fileNameContainer").hidden = false;
    document.getElementById("fileName").hidden = false;
    document.getElementById("fileName").textContent = file.name;
    document.getElementById("fileEditButton").hidden = false;
    document.getElementById("upload").hidden = false;
    document.getElementById("browseButton").hidden = true;
    document.getElementById("browseText").hidden = true;
}
function unhideBrowse() {
    document.getElementById("fileNameContainer").hidden = true;
    document.getElementById("fileName").hidden = true;
    document.getElementById("fileEditButton").hidden = true;
    document.getElementById("upload").hidden = true;
    document.getElementById("browseButton").hidden = false;
    document.getElementById("browseText").hidden = false;
}
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
function notification(title, body, link) {
    var notification_div = document.createElement("div");
    notification_div.classList.add("fixed", "inset-0", "flex", "items-center", "justify-center", "bg-black/25", "backdrop-blur-md", "notification")
    notification_div.innerHTML =
    `<div class="bg-zinc-900 p-6 rounded-lg shadow-md notification">
    <h1 class="notification text-white text-2xl text-bold">${title}</h1>
    <p class="notification text-white">${body}</p>
    <a href="${link}" class="text-stone-400">${link}</a>
    <br>
    <button onclick="document.querySelectorAll('.notification').forEach(element => element.remove());" class="mt-4 bg-zinc-700 hover:bg-zinc-600 transition-all text-white py-2 px-4 rounded-full notification">
        Close
    </button>
</div>`;
    document.body.appendChild(notification_div);
}
function updateProgressBar(progress) {
    document.getElementById("progress-container").hidden = false;
    document.getElementById("progress").style.width = progress * 2.5;
    document.getElementById("progress-text").textContent = String(Math.round(progress)) + "%"
    if (progress >= 100) {
        document.getElementById("progress-container").hidden = true;
    }
    if (progress <= 10) {
        document.getElementById("progress-text").textContent = "";
    }
    if (progress <= 1) {
        document.getElementById("progress").style.width = 0;
    }
}