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
async function upload() {
    console.log(file);
    var base64basename = btoa(file.name.substring(0, file.name.lastIndexOf('.'))).slice(0, 56)
    const fileBytes = bytesToBase64(await extractBytesFromFile(file));
    const chunkSize = 24 * 1024 * 1024;
    const numChunks = Math.ceil(fileBytes.length / chunkSize);
    const chunks = [];
    for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, fileBytes.length);
        const chunk = fileBytes.slice(start, end);
        chunks.push(chunk);
    }
    for (let i = 0; i < chunks.length; i++) {
        const fileName = base64basename + "_" + String(parseFloat(i)+1) +".txt"
        const formData = new FormData();
        formData.append('payload_json', JSON.stringify({content: `Uploaded file: ${fileName} (Part ${parseFloat(i) + 1}/${chunks.length})`,}));
        formData.append("file[0]", new Blob([chunks[i]]), base64basename + "_" + String(parseFloat(i)+1) +".txt");
        response = await fetch("https://discord.com/api/webhooks/1224099792335015936/mtKNdsa5rW49vCEBW2htgdJSeLZF2nr-Y2viblSM4zVYXfXn9Wd98GhzGzG6s9qWcNQl", {"method": "POST", "body": formData});
        if (response.ok) {
            responseText = await response.text();
            attachement_url = JSON.parse(responseText)["attachments"][0]["url"];
            console.log(attachement_url);
            return attachement_url;
        } 
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
function bytesToBase64(bytes) {
    var binary = '';
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
async function extractBytesFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const arrayBuffer = event.target.result;
            const bytes = new Uint8Array(arrayBuffer);
            resolve(bytes);
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
}