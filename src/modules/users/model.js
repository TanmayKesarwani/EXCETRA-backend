const mongoose = require("mongoose");
require("dotenv").config();
const db = require("../../utilities/db");
const jwt = require("jsonwebtoken");
const constants = require("../../utilities/constants");

const backgroundSchema = new mongoose.Schema({
  checkdone: {
    type: Boolean,
    required: true
  },
  comment: {
    type: String,
    required: false
  }
});

const policeVerifySchema = new mongoose.Schema({
  policecheckdone: {
    type: Boolean,
    required: true
  },
  comments: {
    type: String,
    required: false
  }
});


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  emergencyNumber: {
    type: Number,
    required: false,
  },
  whatsappNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contactAdd: {
    type: String,
    required: true,
  },
  permanentAdd: {
    type: String,
    required: true,
  },
  reportingTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  aadhaarNumber: {
    type: String,
    required: false
  },
  requiredbackgroudfiles: backgroundSchema,
  policeverification: policeVerifySchema,

  roles: {
    type: [String],
    required: true,
  },
  tokens: {
    accessToken: { type: String },
    Access_ts: { type: String }, // issue time stamp
    access_validity_dur: { type: Number }, // validity
    refreshToken: { type: String }, // refresh token
    refresh_ts: { type: Date }, // issue time stamp
    refresh_validity_dur: { type: Number }, // validity in days
  },
  webNotificationToken: {
    type: [String],
    default: [],
  },
},
  { timestamps: true }
);

//generating access token
userSchema.methods.generateAuthAccessToken = async function () {
  try {
    const accessToken = jwt.sign(
      {
        email: this.email,
        phoneNumber: this.phoneNumber,
        roles: this.roles,
        user_id: this._id,
        whatsappNumber: this.whatsappNumber
      },
      process.env.JWT_SECRET,
      { issuer: process.env.ISSUER }
    );

    this.tokens.accessToken = accessToken;
    this.tokens.Access_ts = new Date();
    this.tokens.access_validity_dur = 1;

    await this.save();
    return accessToken;
  } catch (error) {
    throw error;
  }
};

//generating refresh token
userSchema.methods.generateAuthrefreshToken = async function () {
  try {
    const refreshToken = jwt.sign(
      {
        email: this.email,
        phoneNumber: this.phoneNumber,
        roles: this.roles,
        user_id: this._id,
        whatsappNumber: this.whatsappNumber
      },
      process.env.JWT_REFRESH_SECRET,
      { issuer: process.env.ISSUER }
    );

    this.tokens.refreshToken = refreshToken;
    this.tokens.refresh_ts = new Date();
    this.tokens.refresh_validity_dur = 7;
    await this.save();
    return refreshToken;
  } catch (error) {
    throw error;
  }
};

userSchema.methods.generateWebToken = async function (token) {
  try {
    this.webNotificationToken.push(token);
    await this.save();
  } catch (error) {
    throw error;
  }
};

module.exports = db.model("User", userSchema);
