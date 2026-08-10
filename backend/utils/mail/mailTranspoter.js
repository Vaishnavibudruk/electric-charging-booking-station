require("dotenv").config();
const nodemailer = require("nodemailer");

module.exports.transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.AUTH_USER,
    pass: process.env.AUTH_PASSWORD,
  },
});
