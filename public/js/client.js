const socket = io();

let username;
const chats = document.querySelector(".chats");
const usersList = document.querySelector(".users-list");
const usersCount = document.querySelector(".users-count");
const msgSend = document.querySelector("#user-send");
const userMsg = document.querySelector("#user-msg");
const fileUpload = document.querySelector("#file-upload");

do {
    username = prompt("Enter your name: ");
} while (!username);

socket.emit("new-user-joined", username);

socket.on('user-connected', (socketName) => {
    userJoinLeft(socketName, 'joined');
});

// Function to create joined/left status div
function userJoinLeft(name, status) {
    const div = document.createElement("div");
    div.classList.add('user-join');
    const content = `<p><b>${name}</b> ${status} the chat</p>`;
    div.innerHTML = content;
    chats.appendChild(div);
    chats.scrollTop = chats.scrollHeight;
}

socket.on('user-disconnected', (user) => {
    userJoinLeft(user, 'left');
});

// Update users list and user count
socket.on('user-list', (users) => {
    usersList.innerHTML = "";
    const usersArr = Object.values(users);
    for (let i = 0; i < usersArr.length; i++) {
        const p = document.createElement('p');
        p.innerText = usersArr[i];
        usersList.appendChild(p);
    }
    usersCount.innerHTML = usersArr.length;
});

function sendMessage() {
    const data = {
        user: username,
        msg: userMsg.value
    };
    if (userMsg.value !== '') {
        appendMessage(data, 'outgoing');
        socket.emit('message', data);
        userMsg.value = "";
    }
}

msgSend.addEventListener('click', sendMessage);

userMsg.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        sendMessage();
    }
});

fileUpload.addEventListener('change', () => {
    const file = fileUpload.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        const data = {
            user: username,
            file: reader.result,
            fileName: file.name,
            fileType: file.type
        };
        appendFile(data, 'outgoing');
        socket.emit('file', data);
        fileUpload.value = '';
    };
    if (file) {
        reader.readAsDataURL(file);
    }
});

function appendMessage(data, status) {
    const div = document.createElement('div');
    div.classList.add('message', status);
    const content = `
        <h5>${data.user}</h5>
        <p>${data.msg}</p>`;
    div.innerHTML = content;
    chats.appendChild(div);
    chats.scrollTop = chats.scrollHeight;
}

function appendFile(data, status) {
    const div = document.createElement('div');
    div.classList.add('message', status);
    let content = `<h5>${data.user}</h5>`;
    if (data.fileType.startsWith('image/')) {
        content += `<p><a href="${data.file}" download="${data.fileName}"><img src="${data.file}" alt="${data.fileName}" style="max-width: 200px; cursor: pointer;"></a></p>`;
    } else if (data.fileType === 'application/pdf') {
        content += `<p><a href="${data.file}" download="${data.fileName}">${data.fileName}</a></p>`;
    }
    div.innerHTML = content;
    chats.appendChild(div);
    chats.scrollTop = chats.scrollHeight;
}

socket.on('message', (data) => {
    appendMessage(data, 'incoming');
});

socket.on('file', (data) => {
    appendFile(data, 'incoming');
});
