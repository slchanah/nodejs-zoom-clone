const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { ExpressPeerServer } = require('peer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.Server(app);
const io = socketIo(server);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get('/:room', (req, res) => {
  res.render('room', {
    roomId: req.params.room,
  });
});

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

io.on('connection', (socket) => {
  socket.on('join-room', (ROOM_ID, userId) => {
    socket.join(ROOM_ID);
    socket.to(ROOM_ID).broadcast.emit('user-connected', userId);

    socket.on('message', (message) => {
      io.to(ROOM_ID).emit('createMessage', message);
    });
  });
});

server.listen(3030, () => {
  console.log('Server starts');
});
