// models/StationDetails.js
const mongoose = require("mongoose");

const stationDetailsSchema = new mongoose.Schema(
  {
    stationUser_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "STATION_REGISTRATION",
      required: true,
    },

    stationName: { type: String, required: true, trim: true },
    stationId: { type: String, required: true, uppercase: true },

    stationEmail: { type: String, required: true },
    stationMobile: { type: String, required: true },

    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    stationCoordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    vehicleType: [
      {
        type: String,
        required: true,
      },
    ],

    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    ports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "STATION_PORTS",
      },
    ],
  },
  { timestamps: true }
);

// Geo Index
stationDetailsSchema.index({ stationCoordinates: "2dsphere" });

module.exports = mongoose.model("STATION_DETAILS", stationDetailsSchema);
