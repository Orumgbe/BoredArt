import Router from 'express';
import RoomController from './controllers/RoomController';
import UserController from './controllers/UserController';

// Initialize instance of express Router
const router = Router();

// Home page
router.get('/', (req, res) => {
  res.render('home');
});

// Create room
router.get('/create-room', RoomController.createRoom);

// Name retrieval form and room joining
router.all('/room/:roomId/join', RoomController.joinRoom);

// Room page
router.get('/room/:roomId', RoomController.displayRoom);

// Get room users
router.get('/api/:roomId', UserController.getAllUsers);

// Export router
module.exports = router;
