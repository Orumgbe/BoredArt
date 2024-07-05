import Router from 'express';
import path from 'path';

// Initialize instance of express Router
const router = Router();

// Home page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Export router
module.exports = router;
