const mongoose = require('mongoose');
const db = require("../../utilities/db");

const otpSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true,
    },
    otp : {
        type : String,
        required : true,
        trim : true,
    },
    expiresIn : {
        type : Number,
    },
},
{ timestamps: true });

module.exports = db.model("OTP", otpSchema);