import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';

// Handle room requests
class RoomController {
  // Room creation
  static async createRoom(req, res) {
    const roomId = uuidv4();
    // Placeholder member info
    const username = 'placeholder';
    const userData = {
      id: 0,
      score: 0,
      isActive: false,
      socketID: null,
    };
    const userStr = JSON.stringify(userData);
    console.log(`Details - ${roomId}, { ${username}: ${userStr} }`);
    try {
      // Increase room TTL to test member connection and disconnection
      await redisClient.setRoomMember(roomId, username, userStr, 300);
      res.redirect(`/room/${roomId}`);
    } catch (error) {
      res.status(500).send(`Error creating room: ${error}`);
    }
  }

  // Handle room joining
  static async joinRoom(req, res) {
    const { roomId } = req.params;
    if (req.method === 'GET') {
      // Send form to get username
      console.log('Views directory:', path.join(__dirname, 'public'));
      res.render('join', { roomId });
    } else if (req.method === 'POST') {
      // Process new user joining
      const { username } = req.body;
      // Get room from redis
      try {
        const roomMembers = await redisClient.getAllRoomMembers(roomId);
        if (roomMembers.length === 5) {
          console.log('room is full');
          res.redirect('/');
        } else {
          // Do later -> check if that username is already in the room (avoid overwriting)
          const userData = {
            id: roomMembers.length,
            score: 0,
            socketID: null,
          };
          const userStr = JSON.stringify(userData);
          await redisClient.setRoomMember(roomId, username, userStr);
          if ('placeholder' in roomMembers) await redisClient.delRoomMember(roomId, 'placeholder');
          // Cookie for tracking room request
          res.cookie(`room-${roomId}-name`, username, { maxAge: 300000, httpOnly: true });
          res.redirect(`/room/${roomId}`);
        }
      } catch (error) {
        console.log(error);
        res.status(404).send('Room not found');
      }
    }
  }

  // Room page
  static async displayRoom(req, res) {
    const { roomId } = req.params;
    const cookieName = req.cookies[`room-${roomId}-name`];
    if (!roomId) {
      res.redirect('/');
    } else if (!cookieName) {
      res.redirect(`/room/${roomId}/join`);
    } else {
      try {
        const roomObj = await redisClient.getAllRoomMembers(roomId);
        if (!roomObj) {
          res.status(404).send('Room not found');
        } else {
          console.log('Data is in redis, Trust');
          res.status(200).render('room');
        }
      } catch (error) {
        res.status(404).send('Room not found');
      }
    }
  }
}

module.exports = RoomController;
