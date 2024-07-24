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
      socketId: null,
    };
    const userStr = JSON.stringify(userData);
    try {
      // Create room - set expiration to 24 hours, to cleanup memory
      await redisClient.setRoomMember(roomId, username, userStr, 86400);
      res.redirect(`/room/${roomId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send(`An error occurred while attempting to create a room`);
    }
  }

  // Handle room joining
  static async joinRoom(req, res) {
    const { roomId } = req.params;
    if (req.method === 'GET') {
      // Send form to get username
      res.render('join', { roomId });
    } else if (req.method === 'POST') {
      // Process new user joining
      const { username } = req.body;
      // Get room from redis
      try {
        const roomMembers = await redisClient.getAllRoomMembers(roomId);
        if (Object.keys(roomMembers).length === 5) {
          console.log('room is full');
          res.redirect('/');
        } else {
          // Add in next version -> check if that username is already in the room (avoid overwriting)
          const userData = {
            socketId: null,
          };
          const userStr = JSON.stringify(userData);
          await redisClient.setRoomMember(roomId, username, userStr);
          if ('placeholder' in roomMembers) await redisClient.delRoomMember(roomId, 'placeholder');
          // Cookie for tracking room request -> Autodelete after 24 hours
          res.cookie(`room-${roomId}-name`, username, { maxAge: 86400000, httpOnly: true });
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
          res.status(404).send('Room not found -> 1');
        } else {
          res.status(200).render('room', { roomId });
        }
      } catch (error) {
        console.error(error);
        res.status(404).send('An error occurred');
      }
    }
  }

  // Clear user cookie 
  static clearCookie(req, res) {
    const { roomId } = req.params;
    res.clearCookie(`room-${roomId}-name`);
    console.log('Cookie cleared');
    res.redirect('/');
  }
}

module.exports = RoomController;
