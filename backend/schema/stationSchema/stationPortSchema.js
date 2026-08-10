const mongoose = require("mongoose");

const stationPortSchema = new mongoose.Schema(
  {
    station_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "STATION_DETAILS",
      required: true,
    },

    portType: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    totalPorts: {
      type: Number,
      required: true,
      min: [1, "Total ports must be at least 1"],
    },

    availablePorts: {
      type: Number,
      required: true,
      min: [0, "Available ports cannot be negative"],
      validate: {
        validator: function (v) {
          return v <= this.totalPorts;
        },
        message: "Available ports cannot be more than total ports",
      },
    },

    inUsePorts: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
  },
  { timestamps: true }
);

// Pre-save: calculate inUsePorts before saving a new document
stationPortSchema.pre("save", function () {
  if (this.totalPorts != null && this.availablePorts != null) {
    this.inUsePorts = this.totalPorts - this.availablePorts;
  } else {
    this.inUsePorts = 0;
  }
});

// Pre-update: calculate inUsePorts before updating using findOneAndUpdate or updateOne
// Pre-update: calculate inUsePorts before updating using findOneAndUpdate or updateOne
stationPortSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  if (update.$set) {
    const total = update.$set.totalPorts;
    const available = update.$set.availablePorts;

    // Only calculate if total/available provided
    if (total !== undefined && available !== undefined) {
      update.$set.inUsePorts = total - available;
    }
  }
});

module.exports = mongoose.model("STATION_PORTS", stationPortSchema);
