const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('a user connected to the server', socket.id);
  socket.broadcast.emit('event', {type: 'join', from: socket.id, role: socket.handshake.query.role});

  socket.on('event', evt => {
    console.log('a signaling event was sent:', JSON.stringify(evt.type));
    io.sockets.sockets.get(evt.to).emit('event', evt);
  });

  socket.on('disconnecting', _ => {
    console.log('a user is leaving', socket.id);
    socket.broadcast.emit('event', {type: 'bye', from: socket.id});
  });
});

http.listen(port || 3000, () => {
  console.log('listening on', port);
});
