const mongoose = require("mongoose");
require("dotenv").config();
const db = require("../../utilities/db");
const jwt = require("jsonwebtoken");
const constants = require("../../utilities/constants");

const apartmentSchema = new mongoose.Schema({
    apartmentName: {
        type: String,
        required: false
    },
    landmark: {
        type: String,
        required: false
    },
    locationPin: {
        type: String,
        required: false
    },
    areaManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    requestedby : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "clientUser",
    },
    approved: {
        type: Boolean,
        require: true,
        default: false
    }
})

module.exports = db.model("apartments", apartmentSchema);