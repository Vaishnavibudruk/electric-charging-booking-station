const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    userMobile: {
      type: String,
      required: true,
      trim: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER_REGISTRATION",
      required: true,
    },

    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "STATION_DETAILS",
      required: true,
    },

    port_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "STATION_PORTS",
      required: true,
    },

    units: {
      type: Number,
      required: true,
      min: [1, "Units must be at least 1"],
    },

    pricePerUnit: {
      type: Number,
      required: true,
      min: [0, "Price per unit cannot be negative"],
    },

    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },

    paymentMode: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "NA"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "NA"],
      default: "PENDING",
    },

    bookingStatus: {
      type: String,
      enum: ["PENDING", "INPROGRESS", "COMPLETED", "CANCELLED", "WAITING"],
      default: "PENDING",
    },

    startTime: { type: Date },
    endTime: { type: Date },

    waitingQueuePosition: {
      type: Number,
      default: null,
    },

    isWaiting: {
      type: Boolean,
      default: false,
    },
    expectedArrivalTime: {
      type: Date,
      required: true,
    },
    arrivalDeadline: {
      type: Date,
    },
    estimatedChargingDuration: {
      type: Number,
    },
    vehicleType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BOOKINGS", bookingSchema);
