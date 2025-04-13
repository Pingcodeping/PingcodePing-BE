const nodemailer = require('nodemailer');
//const twilio = require('twilio');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

exports.sendEmail = (to, subject, text) => {
  transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text });
};

// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// exports.sendSMS = (to, body) => {
//   client.messages.create({
//     body,
//     from: process.env.TWILIO_PHONE,
//     to
//   });
// };
