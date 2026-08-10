const express = require("express");
const stationRegistrationSchema = require("../../schema/stationSchema/stationRegistrationSchema");
const { AuthenticateUser } = require("../../utils/middleware/authenticateUser");
const stationDetailsSchema = require("../../schema/stationSchema/stationDetailsSchema");
const stationPortSchema = require("../../schema/stationSchema/stationPortSchema");
const { sendInternalSeverErrorMsg } = require("../../constant/constant");

// initializing express.Router in router for backend routing
const router = express.Router();

router.post(
  "/createPorts",
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    try {
      const userId = req.user._id;

      // Fetch station details for the logged-in user
      const station = await stationDetailsSchema.findOne({
        stationUser_Id: userId,
      });

      if (!station) {
        return res.status(404).json({
          success: false,
          message: "Station details not found. Add station details first.",
        });
      }

      const ports = req.body.ports; // Expecting { ports: [ {...}, {...} ] }

      if (!Array.isArray(ports) || ports.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No ports provided.",
        });
      }

      // Create all ports
      const createdPorts = await stationPortSchema.insertMany(
        ports.map((port) => ({ station_Id: station._id, ...port }))
      );

      // Push all port IDs to station
      createdPorts.forEach((port) => station.ports.push(port._id));
      await station.save();

      res.status(201).json({
        success: true,
        message: "All ports added successfully",
        data: createdPorts,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

router.get(
  "/getPorts",
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    try {
      const userId = req.user._id;

      const station = await stationDetailsSchema
        .findOne({
          stationUser_Id: userId,
        })
        .populate("ports");

      if (!station) {
        return res.status(404).json({
          success: false,
          message: "Station details not found",
        });
      }

      res.status(200).json({
        success: true,
        data: station.ports,
        station_id: station._id,
      });
    } catch (err) {
      sendInternalSeverErrorMsg(res, err);
    }
  }
);

router.put(
  "/updatePorts",
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { ports } = req.body; // expecting { ports: [ {...}, {...} ] }

      if (!Array.isArray(ports) || ports.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No ports provided for update.",
        });
      }

      const station = await stationDetailsSchema.findOne({
        stationUser_Id: userId,
      });

      if (!station) {
        return res.status(404).json({
          success: false,
          message: "Station details not found",
        });
      }

      const updatedPorts = [];

      for (const port of ports) {
        if (port._id) {
          // Update existing port
          if (!station.ports.includes(port._id)) {
            return res.status(403).json({
              success: false,
              message: `Unauthorized to update port with id ${port._id}`,
            });
          }

          const updated = await stationPortSchema.findOneAndUpdate(
            { _id: port._id },
            { $set: port },
            { new: true }
          );

          updatedPorts.push(updated);
        } else {
          // Create new port
          const newPort = await stationPortSchema.create({
            station_Id: station._id,
            ...port,
          });

          // Add to station's ports array
          station.ports.push(newPort._id);
          updatedPorts.push(newPort);
        }
      }

      await station.save();

      res.status(200).json({
        success: true,
        message: "Ports updated successfully",
        data: updatedPorts,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

router.delete(
  "/deletePortById/:portId",
  AuthenticateUser(stationRegistrationSchema),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { portId } = req.params;

      const station = await stationDetailsSchema.findOne({
        stationUser_Id: userId,
      });

      if (!station) {
        return res.status(404).json({
          success: false,
          message: "Station details not found",
        });
      }

      // Ensure port belongs to station
      if (!station.ports.includes(portId)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this port",
        });
      }

      // Delete port
      await stationPortSchema.deleteOne({ _id: portId });

      // Remove from station ports array
      station.ports = station.ports.filter((id) => id.toString() !== portId);
      await station.save();

      res.status(200).json({
        success: true,
        message: "Port deleted successfully",
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

module.exports = router;
