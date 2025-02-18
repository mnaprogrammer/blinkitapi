const nodemailer = require("nodemailer");
require ('dotenv').config();

const sendEmail = async (email, subject, html) => {
    try {
        const transporter = await nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: subject,
            html: html,
          };
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
            } else {
              console.log("Email sent: ", info.response);
            }
          });
    } catch(error) {
        console.log('Email sending error:', error)
    }
}

module.exports = sendEmail;