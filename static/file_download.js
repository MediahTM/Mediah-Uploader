var file = ""
var dropOverGui = false;
let dragCounter = 0;
let downloading = false;
function dropHandler(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item, i) => {
        if (item.kind === "file") {
            if (!downloading) {
                file = item.getAsFile();
                document.querySelectorAll('.dragGui').forEach(element => element.remove());
                dragCounter = 0
                dropOverGui = false;
                handleFileInput(file);
            }
        }
        });
    }
}
function dragEnterHandler(ev) {
    ev.preventDefault();
    dragCounter++;
    if (!dropOverGui&&!downloading) {
        var dragGui = document.createElement("div");
        dragGui.classList.add("fixed", "inset-0", "flex", "items-center", "justify-center", "bg-black/5", "backdrop-blur-sm", "dragGui")
        dragGui.innerHTML = `<div class="bg-zinc-800 p-6 rounded-lg shadow-md dragGui flex flex-col justify-center items-center h-[40%] w-[50%]">
        <h1 class="dragGui text-white text-2xl text-bold m-2">Drag and drop JSON file here</h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file w-[50px] h-[50px]"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
    </div>`
        document.body.appendChild(dragGui);
    }
    dropOverGui = true;
}
function dragLeaveHandler(ev) {
    ev.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
        document.querySelectorAll('.dragGui').forEach(element => element.remove());
        dropOverGui = false;
    }
}
function handleFileInput(file) {
    if (file.name.substring(file.name.lastIndexOf('.'), file.name.length) === ".json") {
        console.log(file)
        getTruncatedFileName();
        hideBrowse()
    } else {
        file = ""
        showError("Only JSON files allowed!")
    }
}
document.getElementById('browse').addEventListener('change', function() {
    file = this.files[0];
    if (file) {
        handleFileInput(file)
    } else {
        unhideBrowse()
    }
});
document.getElementById('fileEditButton').addEventListener('change', function() {
    file = this.files[0];
    if (file) {
        handleFileInput(file)
    } else {
        unhideBrowse()
    }
});
function getTruncatedFileName() {
    if (file.name.length > 20) {
        var truncated = ".."
    }else{
        var truncated = ""
    }
    truncatedFileName = file.name.substring(0, file.name.lastIndexOf('.')).substring(0, 20) + truncated + file.name.substring(file.name.lastIndexOf('.'), file.length).substring(0, 10);
}
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
    document.getElementById("fileName").textContent = truncatedFileName;
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
function hideProgessBar() {
    document.getElementById("progress-container").hidden = true;
    document.getElementById("browseButton").hidden = false;
    document.getElementById("browseText").hidden = false;
    document.getElementById("download").hidden = true;
    document.getElementById("fileName").hidden = true;
}
function updateProgressBar(progress) {
    document.getElementById("progress-container").hidden = false;
    document.getElementById("browse").hidden = true;
    document.getElementById("fileEditButton").hidden = true;
    document.getElementById("fileName").textContent = "Downloading: " + truncatedFileName;
    document.getElementById("download").hidden = true;
    document.getElementById("progress").style.width = progress * 2.5;
    document.getElementById("progress-text").textContent = String(Math.round(progress)) + "%"
    if (progress >= 100) {
        hideProgessBar();
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
async function download() {
    try {
        progress = 0;
        downloading = true;
        updateProgressBar(0)
        fileJson = JSON.parse(await readFile(file))
        fullFile = new Uint8Array(0)
        urls = fileJson["parts"]
        for (var item = 0; item < urls.length; item++) {
            console.log("Fetching URL: " + urls[item]["url"]);
            file = ""
            mb_chunks = Math.ceil(urls[item]["size"] / 4000000)
            for (var mb_chunk = 0; mb_chunk < urls[item]["size"]; mb_chunk += 4000000) {
                if ((mb_chunk + 4000000) > urls[item]["size"]) {
                    end = urls[item]["size"]
                } else {
                    end = mb_chunk + 4000000
                }
                response = await fetch(`/api/download?url=${urls[item]["url"]}&start=${String(mb_chunk)}&end=${String(end)}`)
                body = await response.text()
                file += body
                progress += (100 / (fileJson["parts"].length)) / (mb_chunks)
                updateProgressBar(progress)
            }
            fullFile = appendBase64ToBytesArray(file, fullFile)
        }
        downloadFile(fullFile, fileJson["filename"], "application/octet-stream")
        hideProgessBar()
        downloading = false;
    }catch (error){
        showError(error);
        hideProgessBar();
    }
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
function showError(message) {
    try {
        document.getElementById('error').remove()
    }catch{}
    var errorDiv = document.createElement("div")
    errorDiv.innerHTML = `
    <div id='error' class="animate__animated animate__fadeInDown absolute w-fit top-0 left-0 right-0 mx-auto flex self-center justify-center bg-red-500 m-2 rounded-md py-1 gap-x-3 px-2 transition-all">
        <p>${message}</p>
        <button onclick="document.getElementById('error').remove();"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    </div>`
    document.body.appendChild(errorDiv);
}