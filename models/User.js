const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  preferences: {
    topics: [String],
    time: String,
    numQuestions: Number
  },
  sentQuestions: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DSAQuestion'
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
  
  
});

module.exports = mongoose.model('User', userSchema);
