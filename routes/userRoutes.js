const express = require('express');
const { registerUser, loginUser, updatePreferences,getSentQuestionsForUser } = require('../controllers/userController');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Verifies token
const User = require('../models/User')
const DSAQuestion = require('../models/DSAQuestion')

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Get user without password
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sent-questions', async (req, res) => {
    try {
        const { email } = req.query; // Comes from JWT
        
      const questions = await getSentQuestionsForUser(email);
  
      res.json(questions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/preferences',authMiddleware, updatePreferences);

module.exports = router;

