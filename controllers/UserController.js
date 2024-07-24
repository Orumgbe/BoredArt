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
      console.error(error);
      res.status(404).json({ error: 'Room not found' });
    }
  }

  // Get user
  static async getUser(req, res) {
    const { roomId } = req.params;
    const { username } = req.params;
    try {
      const userData = await redisClient.getRoomMember(roomId, username);
      res.status(200).json(userData);
    } catch (error) {
      console.log(error);
      res.status(404).json({ error: 'User not found' });
    }
  }

  // Update user socket ID
  static async updateUserSocket(req, res) {
    const { roomId } = req.params;
    const { username } = req.params;
    const { socketId } = req.params;

    try {
      const userData = await redisClient.getRoomMember(roomId, username);
      userData['socketId'] = socketId;
      const userStr = JSON.stringify(userData);
      await redisClient.setRoomMember(roomId, username, userStr);
      res.status(200).json({ success: `socket Id updated for ${username}` });
    } catch (error) {
      console.log(error);
      res.status(404).json({ error: 'User not found' });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    const { roomId } = req.params;
    const { username } = req.params;
    try {
      const userData = await redisClient.delRoomMember(roomId, username);
      res.status(200).json({ success: `User ${username} has been deleted`});
    } catch (error) {
      console.log(error);
      res.status(404).json({ error: 'User not found' });
    }
  }
}

module.exports = UserController;
