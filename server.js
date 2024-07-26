const http = require("http");
const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const io = require("socket.io")(server);
var users = {};

io.on("connection", (socket) => {
    socket.on("new-user-joined", (username) => {
        users[socket.id] = username; // Add new user to users object
        socket.broadcast.emit('user-connected', username);
        io.emit("user-list", users); // Update user list for all clients
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit('user-disconnected', users[socket.id]); // Notify others of user disconnection
        delete users[socket.id];
        io.emit("user-list", users);
    });

    socket.on('message', (data) => {
        socket.broadcast.emit("message", {user: data.user, msg: data.msg}); // Broadcast received message
    });

    socket.on('file', (data) => {
        socket.broadcast.emit("file", {user: data.user, file: data.file, fileName: data.fileName, fileType: data.fileType});
    });
});

server.listen(port, () => {
    console.log("Server started at " + port);
});
