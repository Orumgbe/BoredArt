import redisClient from '../utils/redis';

// Handle users
class UserController {
  // Get room users
  static async getAllUsers(req, res) {
    const { roomId } = req.params;
    try {
      const roomMembers = await redisClient.getAllRoomMembers(roomId);
      const users = {};
      for (const username in roomMembers) {
        users[username] = JSON.parse(roomMembers[username]);
      }
      res.status(200).json(users);
    } catch (error) {
      console.log(error);
      res.status(404).json({ error: 'Room not found' });
    }
  }
}

module.exports = UserController;
