const bcrypt = require("bcrypt");
const OTPVerificationSchema = require("../../schema/otpSchema/otpSchema");
const { transporter } = require("./mailTranspoter");

const sendOtpVerificationEmail = async (id, email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
      const hashedOTP = await bcrypt.hash(otp, 12);

      const UserOTPVerificationRecord = await OTPVerificationSchema.findOne({
        userId: id,
      });

      if (UserOTPVerificationRecord) {
        await OTPVerificationSchema.deleteMany({
          _id: UserOTPVerificationRecord._id,
        });
      }

      const newOTP = new OTPVerificationSchema({
        userId: id,
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAT: new Date(Date.now() + 10 * 60 * 1000),
      });

      await newOTP.save();

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<h1>Your OTP is ${otp}</h1>`,
      };

      await transporter.sendMail(mailOptions);
      resolve("Success");
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

module.exports = sendOtpVerificationEmail;
