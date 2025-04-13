const mongoose = require('mongoose');

const dsaQuestionSchema = new mongoose.Schema({
  platform: String, // e.g., "Codeforces"
  question: String,
  topic: String
});

module.exports = mongoose.model('DSAQuestion', dsaQuestionSchema);

// models/DSAQuestion.js
// models/DSAQuestion.js
// import mongoose from 'mongoose';

// const dsaQuestionSchema = new mongoose.Schema({
//   platform: String, // e.g., "Codeforces"
//   question: String,
//   topic: String,
//   externalId: { type: String, unique: true }, // optional but recommended
// });

// const DSAQuestion = mongoose.model('DSAQuestion', dsaQuestionSchema);

// export default DSAQuestion;
