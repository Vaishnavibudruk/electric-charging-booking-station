const express = require("express");
const bcrypt = require("bcrypt");
const stationRegistrationSchema = require("../../schema/stationSchema/stationRegistrationSchema");
const sendOtpVerificationEmail = require("../../utils/mail/sendOtpVerificationEmail");
const { sendInternalSeverErrorMsg } = require("../../constant/constant");
const userOTPVerification = require("../../schema/otpSchema/otpSchema");
const { AuthenticateUser } = require("../../utils/middleware/authenticateUser");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const stationDetailsSchema = require("../../schema/stationSchema/stationDetailsSchema");
const stationPortSchema = require("../../schema/stationSchema/stationPortSchema");

// initializing express.Router in router for backend routing
const router = express.Router();

router.post("/register", async (req, res) => {
  const { userName, mobile, email, password } = req.body;
  try {
    // Hash password
    const securedPassword = await bcrypt.hash(password, 12);

    // Check if station already registered by email
    const existingStation = await stationRegistrationSchema.findOne({ email });

    // ------------------------------------------------------------
    // CASE 1: STATION ALREADY EXISTS
    // ------------------------------------------------------------
    if (existingStation) {
      // If already verified → cannot register again
      if (existingStation.verified) {
        return res.status(400).json({ error: "Station already registered" });
      }

      // If NOT verified → update station details
      const updatedStation = await stationRegistrationSchema.findOneAndUpdate(
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
    const newStation = new stationRegistrationSchema({
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
            await stationRegistrationSchema.updateOne(
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
            await stationRegistrationSchema.updateOne(
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
    const checkExistingUser = await stationRegistrationSchema.findOne({
      email,
    });

    if (!checkExistingUser) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // Check password
    const isPasswordMatched = await bcrypt.compare(
      password,
      checkExistingUser.password
    );

    if (!isPasswordMatched) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    // Generate token
    const token = await checkExistingUser.generateAuthToken();

    // ------------------------------------------
    // CHECK STATION DETAILS EXISTS
    // ------------------------------------------
    const stationDetails = await stationDetailsSchema.findOne({
      stationUser_Id: checkExistingUser._id,
    });

    const isStationDetails = stationDetails ? true : false;

    // ------------------------------------------
    // CHECK PORTS EXISTS (only if station details exist)
    // ------------------------------------------
    let isPortExist = false;

    if (stationDetails) {
      const port = await stationPortSchema.findOne({
        station_Id: stationDetails._id,
      });

      if (port) isPortExist = true;
    }

    // ------------------------------------------
    // SEND RESPONSE
    // ------------------------------------------
    return res.status(200).json({
      message: "Logged in successful",
      token,
      userId: checkExistingUser._id,
      isStationDetails, // true / false
      isPortExist, // true / false
    });
  } catch (err) {
    sendInternalSeverErrorMsg(res, err);
  }
});

// api forgot password
router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await stationRegistrationSchema.findOne({ email });
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
  AuthenticateUser(stationRegistrationSchema),
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
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    const { userName, mobile } = req.body;
    const userId = req.user._id;

    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid ObjectId" });
      }

      // Update the station document
      const updatedStation = await stationRegistrationSchema.findByIdAndUpdate(
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
        return res.status(404).json({ error: "Station not found" });
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

router.put(
  "/change-password",
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    try {
      const { originalPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user._id;

      // Fetch station profile using email from auth
      const profile = await stationRegistrationSchema.findById(userId);

      if (!profile) {
        return res.status(404).json({ error: "Station profile not found" });
      }

      // Validate original password
      const isPasswordCorrect = await bcrypt.compare(
        originalPassword,
        profile.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Invalid existing password" });
      }

      // Validate confirm password
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          error: "New password and confirm password do not match",
        });
      }

      // Save new hashed password
      const newHashedPassword = await bcrypt.hash(newPassword, 12);
      profile.password = newHashedPassword;
      await profile.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        error: "Failed to update password",
        err,
      });
    }
  }
);

// we export the router because we are using it in index.js file
module.exports = router;
