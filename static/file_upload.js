var file
let dropOverGui = false;
let dragCounter = 0;
let uploading = false;
let selectedSlide = "fileSelect";
var output_json = false;
function dragOverHandler(ev) {
    ev.preventDefault();
}
function dropHandler(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.items && !uploading) {
        [...ev.dataTransfer.items].forEach((item, i) => {
            if (item.kind === "file") {
                file = item.getAsFile();
                document.querySelectorAll('.dragGui').forEach(element => element.remove());
                dragCounter = 0
                dropOverGui = false;
                getTruncatedFileName();
                hideBrowse()
                console.log(file)
            }
        });
    }
}
function dragEnterHandler(ev) {
    if (ev.dataTransfer.types.indexOf('Files') >= 1) {
        ev.preventDefault();
        dragCounter++;
        if (!dropOverGui && !uploading) {
            var dragGui = document.createElement("div");
            dragGui.classList.add("fixed", "inset-0", "flex", "items-center", "justify-center", "bg-black/5", "backdrop-blur-sm", "dragGui")
            dragGui.innerHTML = `<div class="bg-zinc-800 p-6 rounded-lg shadow-md dragGui flex flex-col justify-center items-center h-[40%] w-[50%]">
            <h1 class="dragGui text-white text-2xl text-bold m-2">Drag and drop file here</h1>
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
function getTruncatedFileName() {
    if (file.name.length > 20) {
        var truncated = ".."
    } else {
        var truncated = ""
    }
    truncatedFileName = file.name.substring(0, file.name.lastIndexOf('.')).substring(0, 20) + truncated + file.name.substring(file.name.lastIndexOf('.'), file.length).substring(0, 10);
}
async function processFile() {
    output = await getInput();
    if (output["fileNameInput"]) {
        file = new File([file], output["fileNameInput"], {type: file.type})
        getTruncatedFileName();
    }
    console.log(output)
    uploading = true;
    const chunkSize = 16 * 1024 * 1024;
    const chunks = Math.ceil(file.size / chunkSize)
    let offset = 0;
    if (file.name.includes(".")) {
        baseFileName = file.name.substring(0, file.name.lastIndexOf('.'))
    }else{
        baseFileName = file.name
    }
    base64basename = btoa(baseFileName).slice(0, 56)
    i = 0
    updateProgressBar(0)
    const reader = new FileReader();
    attachement_urls = []
    reader.onload = async function () {
        i += 1
        const fileName = base64basename + "_" + String(i) + ".txt"
        try {
            await upload(arrayBufferToBase64(reader.result), fileName, chunks, i).then(url => {
                attachement_urls.push(url);
            })
        } catch (error) {
            if (String(error).includes("NetworkError")) {
                notification('Request blocked!', 'It looks like our request to Discord was blocked by a third party! Check out our troubleshooting guide at:', `https://github.com/MediahTM/Mediah-Uploader/wiki/Troubleshooting`);
            } else {
                console.log(error)
            }
            return
        }
        progress += (i / chunks) * 100
        updateProgressBar(progress)
        if (offset < file.size) {
            readNextChunk();
        } else {
            const encoder = new TextEncoder()
            const data = encoder.encode(JSON.stringify({ parts: attachement_urls, filename: file.name, uploaded_size: file.size }, null, 4))
            const formData = new FormData();
            formData.append('payload_json', JSON.stringify({
                "content": `${file.name} has been fully uploaded using Mediah! It can be downloaded [here](https:/mediah.vercel.app/download?file=${file.name})!`,
                "embeds": [
                    {
                        "title": "Go to Mediah now and get unlimited storage!",
                        "description": "Mediah offers completely free unlimited cloud storage courtesy of Discord! We have a wide variety of music, movies and more all hosted using Discord avaliable for download!",
                        "url": "https://mediah.vercel.app",
                        "color": null,
                        "image": {
                            "url": "https://avatars.githubusercontent.com/u/165603488?s=48&v=4"
                        }
                    }
                ]
            }));
            formData.append("file[0]", new Blob([(data)]), "[MEDIAH FILE] " + baseFileName + ".json");
            const response = await fetch("https://discord.com/api/webhooks/1224099792335015936/mtKNdsa5rW49vCEBW2htgdJSeLZF2nr-Y2viblSM4zVYXfXn9Wd98GhzGzG6s9qWcNQl", { "method": "POST", "body": formData });
            downloadFile(data, "[MEDIAH FILE] " + baseFileName + ".json", "application/octet-stream")
            if (Object.keys(output_json).length > 0) {
                xhr = new XMLHttpRequest()
                xhr.open("POST", `https://mediah.vercel.app/api/new_file?collection=files&name=${file.name}`, true)
                xhr.send(JSON.stringify({ parts: attachement_urls, filename: file.name, uploaded_size: file.size }, null, 4))
                notification("Your file has been uploaded!", "Your file is now on the Mediah servers. To share it with others, simply use the link below!", "https://mediah.vercel.app/download?file="+file.name)
            }
            uploading = false;
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
    formData.append('payload_json', JSON.stringify({ content: `Uploaded file: ${fileName} (Part ${currentChunk}/${chunks})`, }));
    formData.append("file[0]", new Blob([(chunk)]), fileName);
    const response = await fetch("https://discord.com/api/webhooks/1224099792335015936/mtKNdsa5rW49vCEBW2htgdJSeLZF2nr-Y2viblSM4zVYXfXn9Wd98GhzGzG6s9qWcNQl", { "method": "POST", "body": formData });
    if (response.ok) {
        const responseText = await response.text();
        const attachment_url = JSON.parse(responseText)["attachments"][0]["url"].split("?")[0]
        console.log("Uploaded: " + attachment_url);
        return { url: attachment_url, size: chunk.length }
    }
}
document.getElementById('browse').addEventListener('change', function () {
    file = this.files[0];
    if (file) {
        getTruncatedFileName();
        hideBrowse();
    } else {
        unhideBrowse();
    }
});
document.getElementById('fileEditButton').addEventListener('change', function () {
    file = this.files[0];
    if (file) {
        getTruncatedFileName();
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
    document.getElementById("fileName").textContent = truncatedFileName;
    document.getElementById("fileEditButton").hidden = false;
    document.getElementById("upload").hidden = false;
    document.getElementById("browseButton").hidden = true;
    document.getElementById("browseButton").classList.add("hidden");
    document.getElementById("browseText").hidden = true;
}
function unhideBrowse() {
    document.getElementById("progress-container").hidden = true;
    document.getElementById("browseButton").hidden = false;
    document.getElementById("browseText").hidden = false;
    document.getElementById("upload").hidden = true;
    document.getElementById("fileName").hidden = true;
    document.getElementById("fileNameContainer").hidden = true;
    document.getElementById("fileName").hidden = true;
    document.getElementById("fileEditButton").hidden = true;
    document.getElementById("upload").hidden = true;
    document.getElementById("browseButton").hidden = false;
    document.getElementById("browseButton").classList.remove("hidden");
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
    document.getElementById("browse").hidden = true;
    document.getElementById("fileEditButton").hidden = true;
    document.getElementById("fileName").textContent = "Uploading: " + truncatedFileName;
    document.getElementById("upload").hidden = true;
    document.getElementById("progress").style.width = progress * 2.5;
    document.getElementById("progress-text").textContent = String(Math.round(progress)) + "%"
    if (progress >= 100) {
        unhideBrowse();
    }
    if (progress <= 1) {
        document.getElementById("progress").style.width = 0;
    }
}
function inputTile() {
    var input_div = document.createElement("div");
    input_div.classList.add("fixed", "inset-0", "flex", "items-center", "justify-center", "bg-black/25", "backdrop-blur-md", "inputFileData")
    input_div.innerHTML =
        `<div id="inputFileDiv" class="bg-zinc-900 rounded-lg shadow-md flex flex-col items-center inputFileDiv w-[600px] pb-6">
            <div class="absolute closeInput w-[600px] flex justify-end items-end px-2 py-1">
                <button onclick="output_json={};document.querySelectorAll('.inputFileData').forEach(element => element.remove());">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <h1 class="text-white text-2xl text-bold pt-6">Enter file details</h1>
            <p class="text-white text-md text-center">To make your file publicly accessible, please fill out the details below</p>
            <div class="flex items-center justify-center inset-0 m-2">
                <button class="rounded-l-md bg-zinc-700 px-2 py-1 transition-all" id="fileSelect" onclick="selectSlide('fileSelect');">File</button>
                <button class="rounded-none bg-zinc-800 px-2 py-1 transition-all" id="moviesSelect" onclick="selectSlide('moviesSelect');">Movies/TV</button>
                <button class="rounded-r-md bg-zinc-800 px-2 py-1 transition-all" id="musicSelect" onclick="selectSlide('musicSelect');">Music</button>
            </div>
        </div>`;
    document.body.appendChild(input_div);
    selectSlide("fileSelect")
}
async function returnValue() {
    var input_json = {}
    let valid = true;
    let checksComplete = true;
    document.querySelectorAll(".required-input").forEach((x) => {
        if (!x.value) {
            valid = false;
            x.classList.add("border", "border-red-500", "border-2")
            console.log(x.parentElement)
        }else{
            x.classList.remove("border", "border-red-500", "border-2")
        }
    })
    document.querySelectorAll(".tmdb").forEach((x) => {
        if (x.value.startsWith("https://www.themoviedb.org/movie/") || x.value.startsWith("https://themoviedb.org/movie/") || x.value.startsWith("themoviedb.org/movie/") || x.value.startsWith("www.themoviedb.org/movie/")) {
            movie_id = x.value.replace("https://", "").replace("www.", "").replace("themoviedb.org/movie/", "")
            xhr = new XMLHttpRequest()
            xhr.open("GET", `https://api.themoviedb.org/3/movie/${movie_id}?api_key=bfe60268dcb9f6352a6ff6ce40312265`, true)
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    response = (JSON.parse(xhr.responseText));
                    if (response["success"] == false) {
                        x.classList.add("border", "border-red-500", "border-2")
                        showError("Invalid TMDB URL!")
                        valid = false;
                    }
                    checksComplete = true;
                }
              };
              xhr.send()
              checksComplete = false;
        }else{
            showError("Invalid URL format!")
            x.classList.add("border", "border-red-500", "border-2")
            valid = false;
        }
    })
    document.querySelectorAll(".data-input").forEach((x) => {
        input_json[x.id] = x.value;
    });
    while (!checksComplete) {
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (valid && checksComplete) {
        output_json = input_json;
        document.querySelectorAll('.inputFileData').forEach(element => element.remove())
    }
}
async function getInput() {
    return new Promise(async function (resolve, reject) {
        inputTile("test");
        output_json = false;
        while (!output_json) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        resolve(output_json)
    })
}
var slides =
{
    "fileSelect": [
`<div class="flex items-center justify-center inset-0 m-2">
<p class="text-white text-md">File name</p>
<p class="text-red-500 text-md pr-2">*</p>
<input id="fileNameInput" class="outline-none px-4 h-9 rounded-full bg-zinc-700 data-input required-input"/>
</div>`
    ],
    "moviesSelect": [
`<div class="flex items-center justify-center inset-0 m-2">
<p class="text-white text-md">TheMovieDB URL</p>
<p class="text-red-500 text-md pr-2">*</p>
<input id="TMDBInput" class="outline-none px-4 h-9 rounded-full bg-zinc-700 data-input required-input tmdb"/>
<div class="h-9">
<a href="https://github.com/MediahTM/Mediah-Uploader/wiki/Uploading-movies#themoviedb-url">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-help"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
</a>
</div>
</div>`
    ],
    "musicSelect": [
        "<p>idek where to start with this one</p>"
    ]
}
function selectSlide(slide) {
    for (var i in slides) {
        if (!(i === slide)) {
            element = document.getElementById(i);
            element.classList.remove("bg-zinc-700");
            element.classList += (" bg-zinc-800");
        }
        document.querySelectorAll("." + i + "-item").forEach((x) => { x.remove() })
    } 
    element = document.getElementById(slide);
    element.classList.remove("bg-zinc-800")
    element.classList += (" bg-zinc-700");
    selectedSlide = slide;
    slides[slide].forEach((i) => {
        parent = document.getElementById("inputFileDiv")
        new_element = document.createElement("div")
        new_element.classList += slide + "-item"
        new_element.innerHTML = i
        parent.appendChild(new_element)
    })
    enter = document.createElement("div")
    enter.innerHTML = `<button onclick="returnValue();" class="bg-zinc-700 hover:bg-zinc-600 transition-all text-white py-2 px-4 rounded-full">Enter</button>`
    enter.classList += slide + "-item"
    parent.appendChild(enter)
    if (selectedSlide == "fileSelect") {
        document.getElementById("fileNameInput").value = file.name
    }
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