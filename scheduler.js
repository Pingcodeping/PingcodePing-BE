
const cron = require('node-cron');
const User = require('./models/User');
const { sendEmail, sendSMS } = require('./utils/notifier');
const { fetchDSAQuestions,fetchFromCodeforcesAndSave  } = require('./utils/questionFetcher');


// Run every minute
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  try {
    // 1️⃣ First fetch new questions from Codeforces
    //await fetchFromCodeforcesAndSave();

    const users = await User.find();

    for (const user of users) {
      const prefTime = user.preferences?.time;

      // Check if current time matches user's preference
      if (prefTime === currentTime) {
        try {
          const questions = await fetchDSAQuestions(user._id);

          const message = `Hey ${user.name}! Here are your DSA questions:\n\n${questions
            .map((q, i) => `${i + 1}. ${q.question} (Sent On: ${new Date(q.sentAt).toLocaleString()})`)
            .join('\n')}`;

          await sendEmail(user.email, 'Your Daily DSA Dose', message);
        //  await sendSMS(user.phone, message);

          console.log(`✅ Sent to ${user.name} at ${currentTime}`);
        } catch (err) {
          console.error(`❌ Error for ${user.name}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error during Codeforces sync or user loop:", err.message);
  }
});
