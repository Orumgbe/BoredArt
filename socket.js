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

    socket.on('removeUser', ({ roomId, username }) => {
      socket.leave(roomId);
      console.log(`${username} left room ${roomId}`);
    });

    socket.on('chatMessage', ({ roomId, username, message }) => {
      socket.to(roomId).emit('roomMessage', { username, message });
    });

    // Handle drawing event
    socket.on('drawing', (data) => {
      socket.to(data.roomId).emit('drawing', { username: socket.username, ...data });
      console.log(`${socket.username} sent drawing event in room ${data.roomId}`);
    });

    socket.on('clearCanvas', (data) => {
      socket.to(data.roomId).emit('clearCanvas', (data));
    });

    socket.on('disconnect', () => {
      if (socket.roomId && socket.username) {
        socket.to(socket.roomId).emit('userLeft', socket.username); // Emit userLeft event
        console.log(`${socket.username} left room ${socket.roomId}`);
      }
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = socketHandler;
