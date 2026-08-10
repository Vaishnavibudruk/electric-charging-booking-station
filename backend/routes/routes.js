const express = require("express");

const router = express.Router();

// importing adminmodule routes
// '/station' is the root path means it will be http://localhost:5000/station/apiname for example http://localhost:5000/station/register , http://localhost:5000/station/login
router.use("/station", require("./stationRoutes/stationLoginApi"));
router.use("/station", require("./stationRoutes/stationDetailsApi"));

// importing portmodule routes
router.use("/station", require("./stationRoutes/stationPortApi"));

// importing bookingmodule routes
router.use("/booking", require("./bookingRoutes/bookingApi"));

// usermodule routes
router.use("/user", require("./userRoutes/userLoginApi"));
router.use("/user", require("./userRoutes/userSearchApi"));

module.exports = router;
