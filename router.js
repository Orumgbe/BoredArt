import Router from 'express';
import RoomController from './controllers/RoomController';

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

// Export router
module.exports = router;
