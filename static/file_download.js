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
function download() {
    console.log(file)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/download", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var formData = new FormData();
    formData.append("file", file);
    xhr.send(formData)
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                readFile(file).then(contents => {
                    downloadFile(base64DecodeToBytes(xhr.response), JSON.parse(contents)["filename"], "application/octet-stream")
                });
            } else {
                console.error('Request failed: ' + xhr.status);
        }
    }
}
}
document.getElementById('browse').addEventListener('change', function() {
    file = this.files[0];
    if (file) {
        hideBrowse()
    } else {
        unhideBrowse()
    }
});
document.getElementById('fileEditButton').addEventListener('change', function() {
    file = this.files[0];
    if (file) {
        hideBrowse()
    } else {
        unhideBrowse()
    }
});
function readFile(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function(event) {
            var contents = event.target.result;
            resolve(contents);
        };
        reader.onerror = function(event) {
            reject(event.target.error);
        };
        reader.readAsText(file);
    });
}
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
    document.getElementById("download").hidden = false;
    document.getElementById("browseButton").hidden = true;
    document.getElementById("browseText").hidden = true;
}
function unhideBrowse() {
    document.getElementById("fileNameContainer").hidden = true;
    document.getElementById("fileName").hidden = true;
    document.getElementById("fileEditButton").hidden = true;
    document.getElementById("download").hidden = true;
    document.getElementById("browseButton").hidden = false;
    document.getElementById("browseText").hidden = false;
}
function base64DecodeToBytes(base64String) {
    var binaryString = atob(base64String);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
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
async function fetchAndDecode(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function processData() {
    fileJson = JSON.parse(await readFile(file))
    fullFile = new Uint8Array(0)
    urls = fileJson["parts"]
    for (var item = 0; item < urls.length; item++) {
        console.log(urls[item]["url"]);
        file = ""
        for (var mb_chunk = 0; mb_chunk < urls[item]["size"]; mb_chunk += 4000000) {
            if ((mb_chunk + 4000000) > urls[item]["size"]) {
                end = urls[item]["size"]
            } else {
                end = mb_chunk + 4000000
            }
            response = await fetch(`/api/download/${urls[item]["url"]}?start=${String(mb_chunk)}&end=${String(end)}`)
            body = await response.text()
            file += body
            console.log(body)
        }
        fullFile = appendBase64ToBytesArray(file, fullFile)
    }
    downloadFile(fullFile, fileJson["filename"], "application/octet-stream")
}
function appendBase64ToBytesArray(base64String, uint8Array) {
    const binaryString = atob(base64String);
    const newArray = new Uint8Array(uint8Array.length + binaryString.length);
    newArray.set(uint8Array);
    for (let i = 0; i < binaryString.length; i++) {
        newArray[uint8Array.length + i] = binaryString.charCodeAt(i);
    }
    
    return newArray;
}