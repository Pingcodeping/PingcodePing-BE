// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
// const DSAQuestion = require('../models/DSAQuestion')

// exports.registerUser = async (req, res) => {
//   const { name, email, password, phone } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     const user = await User.create({ name, email, phone, password: hashedPassword });
//     res.status(201).json({ message: "User registered", user });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     res.json({ token, user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// exports.updatePreferences = async (req, res) => {
//   try {
//     const userId = req.user.id; // assuming you've attached the user from JWT
//     const { preferences } = req.body;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { preferences },
//       { new: true }
//     );

//     res.json({
//       message: 'Preferences updated successfully',
//       user: updatedUser,
//     });
//   } catch (err) {
//     console.error('Error updating preferences:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// exports.getSentQuestionsForUser = async (email) => {
//   try {
//     const user = await User.findOne({ email });

//     if (!user) throw new Error('User not found');

//     const validIds = user.sentQuestions.filter(id => mongoose.Types.ObjectId.isValid(id));

//     const questions = await DSAQuestion.find({ _id: { $in: validIds } });

//     return questions;
//   } catch (err) {
//     console.error('Error fetching sent questions:', err.message);
//     throw err;
//   }
// };


const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const DSAQuestion = require('../models/DSAQuestion');

// Register
exports.registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, phone, password: hashedPassword });
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true }
    );

    res.json({
      message: 'Preferences updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get previously sent questions for a user
exports.getSentQuestionsForUser = async (email) => {
  try {
    const user = await User.findOne({ email }).lean(); // lean for plain object

    if (!user) throw new Error('User not found');

    const sentMap = new Map();
    user.sentQuestions.forEach(entry => {
      if (entry.questionId && mongoose.Types.ObjectId.isValid(entry.questionId)) {
        sentMap.set(entry.questionId.toString(), entry.sentAt);
      }
    });

    const questions = await DSAQuestion.find({
      _id: { $in: Array.from(sentMap.keys()) }
    }).lean();

    // Add sentAt to each question
    const enriched = questions.map(q => ({
      ...q,
      sentAt: sentMap.get(q._id.toString())
    }));

    return enriched;
  } catch (err) {
    console.error('Error fetching sent questions:', err.message);
    throw err;
  }
};

