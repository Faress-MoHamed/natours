const nodemailer = require('nodemailer');

const sendEmail =async  opt => {
  //1)create transporter
  const transporter = nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2) define the email option
  const mailOption = {
    from: 'fares mohamed <fares.mohamed01@gamil.com>',
    to:opt.email,
    subject:opt.subject,
    text:opt.message,
  }

  //3)send th mail
  await transporter.sendMail(mailOption);
}

module.exports = sendEmail;