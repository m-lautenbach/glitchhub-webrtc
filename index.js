const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

let people = 0;
const possibleEmoji = ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
let usernames = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname }/index.html`);
});

function getRandom(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function assignEmoji() {
  const emoji1 = possibleEmoji[getRandom(possibleEmoji.length)];
  const emoji2 = possibleEmoji[getRandom(possibleEmoji.length)];
  const emoji3 = possibleEmoji[getRandom(possibleEmoji.length)];
  const emojiSet = emoji1 + emoji2 + emoji3;
  return emojiSet;
}

io.on('connection', (socket) => {
  people++;
  socket.username = assignEmoji();
  socket.pitch = getRandomInt(200, 601);
  usernames.push(socket.username);
  io.sockets.emit('user joined', { people, username: socket.username, usernames });
  socket.on('send', (msg) => {
    io.sockets.emit('chat message', { message: msg.chat, username: socket.username, pitch: socket.pitch });
  });
  socket.on('disconnect', () => {
    people--;
    const result = usernames.filter((name) => name !== socket.username);
    usernames = result;
    io.sockets.emit('user left', { people, username: socket.username, usernames });
  });
});

http.listen(3000, () => {
  console.log('listening in the year *:3000');
});
