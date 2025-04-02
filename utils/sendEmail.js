import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  if (!to || !subject || !text) {
    throw new Error("Missing required parameters");
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_KEY,
    },
  });

  const mailOptions = {
    from: `"Memoize admin" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    const sendEmail = await transporter.sendMail(mailOptions);
    return sendEmail;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default sendEmail;
