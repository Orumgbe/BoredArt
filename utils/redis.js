import redis from 'redis';
import { promisify } from 'util';

// Handle redis client
class RedisClient {
  constructor() {
    this.client = redis.createClient({
      host: 'localhost',
      port: 6379,
    }).on('error', redis.print);
    this.hgetallAsync = promisify(this.client.hgetall).bind(this.client);
    this.hgetAsync = promisify(this.client.hget).bind(this.client);
    this.hsetAsync = promisify(this.client.hset).bind(this.client);
    this.expireAsync = promisify(this.client.expire).bind(this.client);
    this.hdelAsync = promisify(this.client.hdel).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Checks if connection to redis is successful
  isAlive() {
    return this.client.connected;
  }

  // Get room members - return value is { username (str): userData (obj), ... }
  async getAllRoomMembers(roomId) {
    try {
      const roomData = await this.hgetallAsync(roomId);
      return roomData;
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  }

  // Get room member based on username - return: { userData (obj) }
  async getRoomMember(roomId, username) {
    try {
      const userStr = await this.hgetAsync(roomId, username);
      const userData = JSON.parse(userStr);
      return userData;
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  }

  // Add a new member to the room
  // Takes 3 args: roomID (str), username, userData (json string), duration (in seconds)
  async setRoomMember(roomId, username, userData, duration) {
    try {
      await this.hsetAsync(roomId, username, userData);
      if (duration) {
        try {
          await this.expireAsync(roomId, duration);
        } catch (err) {
          console.error('Error setting room TTL');
        }
      }
      console.log(`Added ${username} to room ${roomId}`);
    } catch (err) {
      console.error(`An error occured while adding ${username} to the room.\n${err}`);
      throw err;
    }
  }

  // Deletes room member information
  async delRoomMember(roomId, username) {
    try {
      await this.hdelAsync(roomId, username);
    } catch (err) {
      console.error(`Error occurred while removing member - ${err}`);
    }
  }

  // Deletes room information
  async delRoom(roomId) {
    try {
      await this.delAsync(roomId);
    } catch (err) {
      console.error(`Error occurred while deleting the room - ${err}`);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
