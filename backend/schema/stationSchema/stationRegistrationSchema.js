const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const stationRegistrationSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Geo Index for nearby search
stationRegistrationSchema.index({ stationCoordinates: "2dsphere" });

// JWT Generator
stationRegistrationSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRETE_KEY_STATION);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

module.exports = mongoose.model(
  "STATION_REGISTRATION",
  stationRegistrationSchema
);
