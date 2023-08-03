require("dotenv").config();
const nodemailer = require('nodemailer');

const customResponse = ({
  code = 200,
  status,
  message = "",
  data = {},
  err = {},
  totalResult,
  totalCount,
  totalPage,
}) => {
  const responseStatus = status ? status : code < 300 ? true : false;
  return {
    success: responseStatus,
    code,
    totalResult,
    totalCount,
    data,
    message,
    error: err,
    totalPage,
  };
};

/**
 * @ Custom Pagination Helper
 */
const customPagination = ({ data = [], limit = 15, page = 1 }) => {
  const totalCount = data.length;
  const pageCount = Math.ceil(totalCount / limit);
  const currentPage = page;
  const results = data.slice((page - 1) * limit, page * limit);
  return {
    pageCount,
    totalCount,
    currentPage,
    results,
  };
};

const genPassword = async () => {
  const p = Math.random().toString(36).slice(-8).toString()
  return p;
}

const configureMail = () => {
  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.HOST, // Your SMTP host
    // port: process.env.PORT, // Your SMTP port
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.USER, // Your email address
      pass: process.env.PASSWORD // Your email password
    }
  });

  // Define the email options
  // const mailOptions = {
  //   from: 'your-email@example.com', // Sender address
  //   to: 'recipient@example.com', // List of recipients
  //   subject: 'Hello from Node.js', // Subject line
  //   text: 'Hello, this is a test email sent from Node.js' // Plain text body
  // };

  // // Send the email
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.error('Error sending email:', error);
  //   } else {
  //     console.log('Email sent:', info.response);
  //   }
  // });
  return transporter
}

const shootMails = (mailOptions) => {
  // Send the email
  const transporter = configureMail();
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

const genText = (password) => {
  const text = `Hi, here is your generated password. ${password}. Please use it to log in to the EXCETRA app.`
  console.log(text);
  return text;
}

module.exports = {
  customResponse,
  customPagination,
  genPassword,
  shootMails,
  configureMail,
  genText
};
