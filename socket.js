import redisClient from './utils/redis';

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

    // Handle game logic
    socket.on('startGame', async (roomId) => {
      const gameData = {};
      try {
        const roomMembers = await redisClient.getAllRoomMembers(roomId);
        const users = {};
        for (const username in roomMembers) {
          users[username] = JSON.parse(roomMembers[username]);
        }

        gameData['roundsPlayed'] = 0;
        gameData['rounds'] = 3;
        gameData['users'] = users;
        gameData['wordChoice'] = ['boy', 'airplane', 'tree'];

        io.to(roomId).emit('gameStart', gameData);
      } catch (error) {
        console.error(error);
      }
    });
    // Game logic ends here

    socket.on('chatMessage', ({ roomId, username, message }) => {
      socket.to(roomId).emit('roomMessage', { username, message });
    });

    socket.on('choosing-word', ({ roomId, username }) => {
      socket.to(roomId).emit('player-choosing', (username));
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
