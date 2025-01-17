function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`User connected with socket ID -> ${socket.id}`);

    socket.on('joinRoom', ({ roomId, username }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;
      socket.to(roomId).emit('userJoined', username);
      console.log(`${username} joined ${roomId} with ${socket.id}`);
    });

    socket.on('chatMessage', ({ roomId, username, message }) => {
      socket.to(roomId).emit('roomMessage', { username, message });
    });

    // Handle drawing event
    socket.on('drawing', (data) => {
      socket.to(data.roomId).emit('drawing', { username: socket.username, ...data });
    });

    socket.on('clearCanvas', (data) => {
      socket.to(data.roomId).emit('clearCanvas', (data));
    });

    socket.on('disconnect', () => {
      if (socket.roomId && socket.username) {
        socket.leave(socket.roomId);
        socket.to(socket.roomId).emit('userLeft', socket.username); // Emit userLeft event
        console.log(`${socket.username} left room ${socket.roomId}`);
      }
    });
  });
}

module.exports = socketHandler;
