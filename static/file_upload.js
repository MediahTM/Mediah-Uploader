var file = ""
function dragOverHandler(ev) {
    ev.preventDefault();
    console.log("gay")
}
function dropHandler(ev) {
    console.log("File(s) dropped");
    var fileNameDisplay = document.getElementById('fileName');
    var fileInput = document.getElementById('upload');
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item, i) => {
        if (item.kind === "file") {
            file = item.getAsFile();
            console.log(file)
            fileNameDisplay.textContent = 'Selected file: ' + file.name;
        }
        });
    }
}
function upload() {
    console.log(file)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
}
document.getElementById('upload').addEventListener('change', function() {
    file = this.files[0];
    var fileNameDisplay = document.getElementById('fileName');
    if (file) {
        fileNameDisplay.textContent = 'Selected file: ' + file.name;
    } else {
        fileNameDisplay.textContent = '';
    }
});