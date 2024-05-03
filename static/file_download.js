var file = ""
var dropOverGui = false;
let dragCounter = 0;
let downloading = false;
let fileTypes;

var filetypeicons = {
    "audio": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0"/></svg>`,
    "image": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="10" cy="12" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/></svg>`,
    "3d": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M14.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 13.1a2 2 0 0 0-1 1.76v3.24a2 2 0 0 0 .97 1.78L6 21.7a2 2 0 0 0 2.03.01L11 19.9a2 2 0 0 0 1-1.76V14.9a2 2 0 0 0-.97-1.78L8 11.3a2 2 0 0 0-2.03-.01Z"/><path d="M7 17v5"/><path d="M11.7 14.2 7 17l-4.7-2.8"/></svg>`,
    "video": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><rect width="8" height="6" x="2" y="12" rx="1"/><path d="m10 15.5 4 2.5v-6l-4 2.5"/></svg>`,
    "spreadsheet": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>`,
    "database": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,
    "executable": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m8 16 2-2-2-2"/><path d="M12 18h4"/></svg>`,
    "game": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M21 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2Z"/><path d="M6 15v-2"/><path d="M12 15V9"/><circle cx="12" cy="6" r="3"/></svg>`,
    "code": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></svg>`,
    "certificate": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><circle cx="10" cy="16" r="2"/><path d="m16 10-4.5 4.5"/><path d="m15 11 1 1"/></svg>`,
    "text": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
}

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
    if (ev.dataTransfer.types.indexOf('Files') >= 1) {
        ev.preventDefault();
        dragCounter++;
        if (!dropOverGui && !downloading) {
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
}
function dragLeaveHandler(ev) {
    ev.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
        document.querySelectorAll('.dragGui').forEach(element => element.remove());
        dropOverGui = false;
    }
}
async function handleFileInput(file) {
    if (file.name.substring(file.name.lastIndexOf('.'), file.name.length) === ".json") {
        console.log(file)
        fileJson = JSON.parse(await readFile(file))
        xhr = new XMLHttpRequest()
        xhr.open("GET", "/static/filetype.json")
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                fileTypes = JSON.parse(xhr.responseText)
            }
        }
        xhr.send() 
        while (true) {
            try{
                if (filetypeicons[fileTypes[fileJson["filename"].toLowerCase().substring(fileJson["filename"].lastIndexOf('.')+1, fileJson["filename"].length)]]) {
                    fileImage = filetypeicons[fileTypes[fileJson["filename"].toLowerCase().substring(fileJson["filename"].lastIndexOf('.')+1, fileJson["filename"].length)]]
                }
                else{
                    fileImage = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`
                }
                break;
            }catch{
                await new Promise(r => setTimeout(r, 100));
            }
        }
        console.log(file.name)
        getTruncatedFileName(fileJson["filename"]);
        hideBrowse()
    } else {
        file = ""
        showError("Only JSON files allowed!")
    }
}
document.getElementById('browse').addEventListener('change', function () {
    file = this.files[0];
    if (file) {
        handleFileInput(file)
    } else {
        unhideBrowse()
    }
});
function getTruncatedFileName(name) {
    if (name.length > 20) {
        var truncated = ".."
    } else {
        var truncated = ""
    }
    truncatedFileName = name.substring(0, name.lastIndexOf('.')).substring(0, 20) + truncated + name.substring(name.lastIndexOf('.'), name.length).substring(0, 10);
}
function readFile(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function (event) {
            var contents = event.target.result;
            resolve(contents);
        };
        reader.onerror = function (event) {
            reject(event.target.error);
        };
        reader.readAsText(file);
    });
}
function hideBrowse() {
    document.getElementById("progress-container").hidden = true;
    document.getElementById("download-buttons").classList.remove("hidden");
    document.getElementById("browse-menu").classList.add("hidden");
    document.getElementById("file-menu").classList.remove("hidden");
    document.getElementById("fileName").textContent = truncatedFileName;
    document.getElementById("fileImage").innerHTML = fileImage;
}
function unhideBrowse() {
    document.getElementById("browse-menu").classList.remove("hidden");
    document.getElementById("file-menu").classList.add("hidden");
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
    document.getElementById("progress-text").textContent = String(Math.round(progress)) + "%";
    document.getElementById("download-buttons").classList.add("hidden");
    if (progress >= 100) {
        unhideBrowse();
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
async function downloadFilePart(url, start, end) {
    const response = await fetch(`/api/download?url=${url}&start=${start}&end=${end}`);
    const body = await response.text();
    return body;
}
async function download() {
    progress = 0;
    downloading = true;
    updateProgressBar(0);
    fileJson = JSON.parse(await readFile(file));
    const urls = fileJson["parts"];
    const blobParts = [];
    for (let item = 0; item < urls.length; item++) {
        mb_chunks = Math.ceil(urls[item]["size"] / 4000000)
        console.log("Fetching URL: " + urls[item]["url"]);
        const fileSize = urls[item]["size"];
        let start = 0;
        const chunkSize = 4000000;
        while (start < fileSize) {
            const end = Math.min(start + chunkSize, fileSize);
            const body = await downloadFilePart(urls[item]["url"], start, end);
            const decodedBytes = base64ToArrayBuffer(body);
            blobParts.push(decodedBytes);
            start = end;
            progress += (100 / (fileJson["parts"].length) / (mb_chunks));
            updateProgressBar(progress);
        }
    }
    const concatenatedFile = new Blob(blobParts, { type: "application/octet-stream" });
    const url = URL.createObjectURL(concatenatedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileJson["filename"];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    unhideBrowse();
    downloading = false;
}
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
function showError(message) {
    try {
        document.getElementById('error').remove()
    } catch { }
    var errorDiv = document.createElement("div")
    errorDiv.innerHTML = `
    <div id='error' class="animate__animated animate__fadeInDown absolute w-fit top-0 left-0 right-0 mx-auto flex self-center justify-center bg-red-500 m-2 rounded-md py-1 gap-x-3 px-2 transition-all">
        <p>${message}</p>
        <button onclick="document.getElementById('error').remove();"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    </div>`
    document.body.appendChild(errorDiv);
}
var params = new URLSearchParams(window.location.search);
var fileId = params.get('id');
if (fileId) {
    console.log(`File ID loaded from URL args: ${fileId}`)
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            fileJson = JSON.parse(xhr.responseText)
            if (fileJson["filename"].includes(".")) {
                baseFileName = fileJson["filename"].substring(0, fileJson["filename"].lastIndexOf('.'))
            }else{
                baseFileName = fileJson["filename"]
            }
            console.log(`JSON file loaded: ${xhr.responseText}`);
            file = new File([new Blob([xhr.responseText], { type: 'application/json' })], baseFileName+'.json', { type: 'application/json'});
            handleFileInput(file);
        }
    }
    xhr.open("GET", "https://mediah.vercel.app/api/get_file?collection=files&name=" + fileId, false)
    xhr.send()
}