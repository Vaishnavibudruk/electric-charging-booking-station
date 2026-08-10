const express = require("express");
const stationDetailsSchema = require("../../schema/stationSchema/stationDetailsSchema");
const { sendInternalSeverErrorMsg } = require("../../constant/constant");
const stationPortSchema = require("../../schema/stationSchema/stationPortSchema");
const router = express.Router();

router.get("/getStationDetails", async (req, res) => {
  try {
    const details = await stationDetailsSchema
      .find() // <-- get all station records
      .populate("ports"); // <-- optional populate

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (err) {
    sendInternalSeverErrorMsg(res, err);
  }
});

router.get("/searchStations", async (req, res) => {
  try {
    const { name, address, lat, lng } = req.query;

    const isStationDetailsExist = await stationDetailsSchema.find();
    if (!isStationDetailsExist || isStationDetailsExist.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No station details found",
      });
    }

    // ⭐ 1) Search by coordinates only
    if (lat && lng) {
      const stations = await stationDetailsSchema.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
            distanceField: "distance",
            spherical: true,
            maxDistance: 8 * 1000, // 8km
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        from: "coords",
        count: stations.length,
        data: stations,
      });
    }

    // ⭐ BUILD QUERY
    let query = {};

    // CASE 1: Only Name
    if (name && !address) {
      query.stationName = { $regex: name, $options: "i" };
    }

    // CASE 2: Only Address
    if (!name && address) {
      query.$or = [
        { address: { $regex: address, $options: "i" } },
        { city: { $regex: address, $options: "i" } },
        { state: { $regex: address, $options: "i" } },
      ];
    }

    // CASE 3: BOTH Name AND Address → Filter Name INSIDE Address region
    if (name && address) {
      query = {
        stationName: { $regex: name, $options: "i" },
        $or: [
          { address: { $regex: address, $options: "i" } },
          { city: { $regex: address, $options: "i" } },
          { state: { $regex: address, $options: "i" } },
        ],
      };
    }

    if (Object.keys(query).length === 0) {
      return res.status(200).json({
        success: true,
        from: "name+address",
        count: 0,
        data: [],
      });
    }
    const stations = await stationDetailsSchema.find(query).populate("ports");

    return res.status(200).json({
      success: true,
      from: name && address ? "name+address" : name ? "name" : "address",
      count: stations.length,
      data: stations,
    });
  } catch (err) {
    sendInternalSeverErrorMsg(res, err);
  }
});

// GET PORT BY ID
router.get("/port/:station_Id", async (req, res) => {
  try {
    const { station_Id } = req.params;

    const ports = await stationPortSchema.find({ station_Id });

    if (!ports || ports.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No ports found for this station",
      });
    }

    return res.json({
      success: true,
      data: ports,
    });
  } catch (err) {
    console.error("Error fetching ports:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching ports",
      error: err.message,
    });
  }
});

module.exports = router;
