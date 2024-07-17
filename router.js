import Router from 'express';
import RoomController from './controllers/RoomController';
import UserController from './controllers/UserController';

// Initialize instance of express Router
const router = Router();

// Home page
router.get('/', (req, res) => {
  res.render('home');
});

// Room routing
// Create room
router.get('/create-room', RoomController.createRoom);

// Name retrieval form and room joining
router.all('/room/:roomId/join', RoomController.joinRoom);

// Room page
router.get('/room/:roomId', RoomController.displayRoom);

// API Routes
// Get room users
router.get('/api/:roomId', UserController.getAllUsers);

// Get user based on username
router.get('/api/:roomId/:username', UserController.getUser);

// Delete user based on username
router.get('/api/:roomId/:username/delete', UserController.deleteUser);

// Update game state
// router.post('/api/:roomId/update', GameController.updateState);

// Export router
module.exports = router;
