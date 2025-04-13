import axios from 'axios';
import DSAQuestion from '../models/DSAQuestion.js';
import User from '../models/User.js';

export const fetchDSAQuestions = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.preferences) throw new Error("❌ User or preferences not found");

  const { topics = [], numQuestions = 3 } = user.preferences;
  const alreadySent = new Set(user.sentQuestions.map(entry => entry.questionId?.toString()));
  const selectedQuestions = [];

  for (const topic of topics) {
    const topicQuestions = await DSAQuestion.find({
      topic,
      _id: { $nin: Array.from(alreadySent) }
    });

    for (const q of topicQuestions) {
      if (selectedQuestions.length < numQuestions) {
        selectedQuestions.push({
          question: q.question,
          sentAt: new Date()
        });

        user.sentQuestions.push({
          questionId: q._id,
          sentAt: new Date()
        });
      } else {
        break;
      }
    }

    if (selectedQuestions.length >= numQuestions) break;
  }

  if (selectedQuestions.length < numQuestions) {
    const fallbackQuestions = await DSAQuestion.find({
      topic: { $nin: topics },
      _id: { $nin: Array.from(alreadySent) }
    });

    for (const q of fallbackQuestions) {
      if (selectedQuestions.length < numQuestions) {
        selectedQuestions.push({
          question: q.question,
          sentAt: new Date()
        });

        user.sentQuestions.push({
          questionId: q._id,
          sentAt: new Date()
        });
      } else {
        break;
      }
    }
  }

  await user.save();
  return selectedQuestions;
};

const fetchFromCodeforcesAndSave = async () => {
  try {
    const res = await axios.get('https://codeforces.com/api/problemset.problems');
    const problems = res.data.result.problems;

    if (!Array.isArray(problems)) {
      throw new Error('Unexpected format from Codeforces API');
    }

    const operations = [];

    for (const p of problems) {
      if (!p.name || !p.contestId || !p.index) continue;

      const questionText = `Codeforces: ${p.name}`;
      const uniqueId = `${p.contestId}${p.index}`;
      const topic = (p.tags && p.tags.length > 0) ? p.tags[0] : 'general';

      operations.push({
        updateOne: {
          filter: { externalId: uniqueId },
          update: {
            $setOnInsert: {
              platform: 'Codeforces',
              question: questionText,
              topic,
              externalId: uniqueId,
            }
          },
          upsert: true
        }
      });
    }

    if (operations.length > 0) {
      const result = await DSAQuestion.bulkWrite(operations);
      console.log(`✅ Synced Codeforces: ${result.upsertedCount} new questions added.`);
    } else {
      console.log("ℹ️ No new questions to sync from Codeforces.");
    }

  } catch (err) {
    console.error("❌ Error fetching from Codeforces:", err.message);
  }
};

export { fetchFromCodeforcesAndSave };
