const express = require("express");
const bcrypt = require("bcrypt");
const sendOtpVerificationEmail = require("../../utils/mail/sendOtpVerificationEmail");
const { sendInternalSeverErrorMsg } = require("../../constant/constant");
const userRegistrationSchema = require("../../schema/userSchema/userRegisterSchema");
const userOTPVerification = require("../../schema/otpSchema/otpSchema");
const { AuthenticateUser } = require("../../utils/middleware/authenticateUser");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

// initializing express.Router in router for backend routing
const router = express.Router();

router.post("/register", async (req, res) => {
  const { userName, mobile, email, password } = req.body;

  try {
    // Hash password
    const securedPassword = await bcrypt.hash(password, 12);

    // Check if station already registered by email
    const existingStation = await userRegistrationSchema.findOne({ email });

    // ------------------------------------------------------------
    // CASE 1: STATION ALREADY EXISTS
    // ------------------------------------------------------------
    if (existingStation) {
      // If already verified → cannot register again
      if (existingStation.verified) {
        return res.status(400).json({ error: "Station already registered" });
      }

      // If NOT verified → update station details
      const updatedStation = await userRegistrationSchema.findOneAndUpdate(
        { email },
        {
          $set: {
            userName,
            mobile,
            password: securedPassword,
            verified: false,
          },
        },
        { new: true }
      );

      // Send OTP again
      sendOtpVerificationEmail(updatedStation._id, updatedStation.email);

      return res.status(200).json({
        message: "OTP sent to your email address",
        user_id: updatedStation._id,
        email: updatedStation.email,
      });
    }

    // ------------------------------------------------------------
    // CASE 2: NEW STATION → CREATE NEW RECORD
    // ------------------------------------------------------------
    const newStation = new userRegistrationSchema({
      userName,
      mobile,
      email,
      password: securedPassword,
      verified: false,
    });

    const savedStation = await newStation.save();

    // Send OTP
    sendOtpVerificationEmail(savedStation._id, savedStation.email);

    return res.status(200).json({
      message: "OTP sent to your email",
      user_id: savedStation._id,
      email: savedStation.email,
    });
  } catch (err) {
    sendInternalSeverErrorMsg(res, err);
  }
});

router.post("/verifyOtp", async (req, res) => {
  // same de-structuring of req.body
  const { userId, otp, password } = req.body;
  try {
    // first we check if the user otp is present or not and if we found any user otp then we are storing all the data in UserOTPVerificationRecord
    const UserOTPVerificationRecord = await userOTPVerification.findOne({
      userId,
    });

    // if not present then we return error message to frontend
    if (!UserOTPVerificationRecord) {
      return res.status(400).json({ error: "Please Resend Again" });
    } else {
      //
      const { expiresAt, otp: hashedOtp } = UserOTPVerificationRecord;

      // we check if the otp is expired or not
      if (expiresAt < Date.now()) {
        await userOTPVerification.deleteOne({
          _id: UserOTPVerificationRecord._id,
        });
        return res
          .status(400)
          .json({ message: "OTP Expired. Please Resend Again" });
      } else {
        const validOtp = await bcrypt.compare(otp, hashedOtp);
        if (!validOtp) {
          return res.status(400).json({ error: "Invalid OTP" });
        } else {
          if (password) {
            await userRegistrationSchema.updateOne(
              { _id: userId },
              { $set: { password: await bcrypt.hash(password, 12) } }
            );
            await userOTPVerification.deleteOne({
              _id: UserOTPVerificationRecord._id,
            });
            return res
              .status(200)
              .json({ message: "Password Changed Successfully" });
          } else {
            await userRegistrationSchema.updateOne(
              { _id: userId },
              { $set: { verified: true } }
            );
            await userOTPVerification.deleteOne({
              _id: UserOTPVerificationRecord._id,
            });
            return res.status(200).json({ message: "OTP Verified" });
          }
        }
      }
    }
  } catch (err) {
    sendInternalSeverErrorMsg(res, err);
  }
});

// api for resend otp
router.post("/resentOtp", async (req, res) => {
  const { email, userId } = req.body;
  try {
    const UserOTPVerificationRecord = await userOTPVerification.findOne({
      userId,
    });
    if (UserOTPVerificationRecord) {
      await userOTPVerification.deleteOne({
        _id: UserOTPVerificationRecord._id,
      });
    }
    sendOtpVerificationEmail(userId, email);
    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    sendInternalSeverErrorMsg(res, err);
  }
});

// api for login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkExistingUser = await userRegistrationSchema.findOne({
      email,
    });

    if (!checkExistingUser) {
      //means if existinguser is not present
      return res.status(404).json({ error: "User does not exist" });
    }
    // check entered password is correct or not
    const isPasswordMatched = await bcrypt.compare(
      password,
      checkExistingUser.password
    );

    if (!isPasswordMatched) {
      //means if password is not matched
      return res.status(400).json({ error: "Invalid Credentials" });
    } else {
      const token = await checkExistingUser.generateAuthToken(); //generating jwt token which will be store in browser localstorage and will be used for authorization purpose and storing in browser localstorage will by done by frontend and below we passing that token to frontend
      return res.status(200).json({
        message: "Logged in successful",
        token: token,
        userId: checkExistingUser._id,
      });
    }
  } catch (err) {
    sendInternalSeverErrorMsg(res, err);
  }
});

// api forgot password
router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await userRegistrationSchema.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ error: "User does not exist with the provided email." });
    } else {
      await userOTPVerification.deleteMany({
        userId: existingUser._id,
      });
      sendOtpVerificationEmail(existingUser._id, email);
      return res.status(200).json({
        message: "OTP sent to your email.",
        user_id: existingUser._id,
        email: existingUser.email,
      });
    }
  } catch (err) {
    sendInternalSeverErrorMsg(res, err);
  }
});

// api for get profile
router.get(
  "/getProfile",
  AuthenticateUser(userRegistrationSchema),
  async (req, res) => {
    try {
      const user = req.user;
      return res.status(200).json({ data: user });
    } catch (err) {
      sendInternalSeverErrorMsg(res);
    }
  }
);

// api for update profile
router.put(
  "/updateProfile",
  AuthenticateUser(userRegistrationSchema),
  async (req, res) => {
    const { userName, mobile } = req.body;
    const userId = req.user._id;

    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid ObjectId" });
      }

      // Update the station document
      const updatedStation = await userRegistrationSchema.findByIdAndUpdate(
        userId,
        {
          $set: {
            userName,
            mobile,
          },
        },
        { new: true } // return the updated document
      );

      if (!updatedStation) {
        return res.status(404).json({ error: "User not found" });
      }

      return res
        .status(200)
        .json({ message: "Profile Updated.", data: updatedStation });
    } catch (error) {
      console.error(error);
      sendInternalSeverErrorMsg(res, error);
    }
  }
);

// we export the router because we are using it in index.js file
module.exports = router;
