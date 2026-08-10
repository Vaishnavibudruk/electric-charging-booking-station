const express = require("express");
const stationRegistrationSchema = require("../../schema/stationSchema/stationRegistrationSchema");
const { sendInternalSeverErrorMsg } = require("../../constant/constant");
const { AuthenticateUser } = require("../../utils/middleware/authenticateUser");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const stationDetailsSchema = require("../../schema/stationSchema/stationDetailsSchema");
const stationPortSchema = require("../../schema/stationSchema/stationPortSchema");

// initializing express.Router in router for backend routing
const router = express.Router();

// CREATE Station Details
router.post(
  "/createStationDetails",
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    try {
      const userId = req.user._id;

      // Check if details already exist
      const existing = await stationDetailsSchema.findOne({
        stationUser_Id: userId,
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Station details already exist. Use update API.",
        });
      }

      const details = await stationDetailsSchema.create({
        stationUser_Id: userId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Station details created successfully.",
        data: details,
      });
    } catch (err) {
      sendInternalSeverErrorMsg(res, err);
    }
  }
);

// GET Station Details for logged-in user
router.get(
  "/getStationDetails",
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    try {
      const userId = req.user._id;

      const details = await stationDetailsSchema
        .findOne({
          stationUser_Id: userId,
        })
        .populate("ports"); // optional populate

      if (!details) {
        return res.status(404).json({
          success: false,
          message: "Station details not found",
        });
      }

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (err) {
      sendInternalSeverErrorMsg(res, err);
    }
  }
);

// UPDATE Station Details
router.put(
  "/updateStationDetails",
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    try {
      const userId = req.user._id;

      const updated = await stationDetailsSchema.findOneAndUpdate(
        { stationUser_Id: userId },
        { $set: req.body },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Station details not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Station details updated successfully.",
        data: updated,
      });
    } catch (err) {
      sendInternalSeverErrorMsg(res, err);
    }
  }
);

// DELETE Station Details
router.delete(
  "/deleteStationdetails",
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    try {
      const userId = req.user._id;

      const station = await stationDetailsSchema.findOne({
        stationUser_Id: userId,
      });

      if (!station) {
        return res.status(404).json({
          success: false,
          message: "Station details not found",
        });
      }

      // Optional: delete all ports belonging to station
      await stationPortSchema.deleteMany({ stationId: station._id });

      // Delete station details
      await stationDetailsSchema.deleteOne({ _id: station._id });

      res.status(200).json({
        success: true,
        message: "Station details deleted successfully.",
      });
    } catch (err) {
      sendInternalSeverErrorMsg(res, err);
    }
  }
);

module.exports = router;
