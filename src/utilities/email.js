const { json } = require("express");
const nodemailer = require("nodemailer");

const sendEmail = async (emailData) => {
  
    try {
      // Create a SMTP transporter object
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      // Message object
      const message = {
        from: process.env.USER,
        to: emailData.to,
        cc: emailData.cc,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        // attachments: attachments,
        //   attachments: [{ filename: "ex.png", path: "./ex.png" }],
      };
      let info = await transporter.sendMail(message);
      console.log("Message sent: %s", info.messageId);
      return true

    } catch (error) {
      console.log("hello", error);
      return false
    }
  };
module.exports = {sendEmail}