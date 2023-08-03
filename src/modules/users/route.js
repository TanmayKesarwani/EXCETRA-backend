const express = require("express");
const router = express.Router();
const {
  registerUser,
  logout,
  getAllUsers,
  otpGenerate,
  newlogin,
} = require("./controller");
const {
  verifyToken,
  verifyTokenAndAuthorize,
} = require("../../middleware/auth");

router.post("/register", verifyTokenAndAuthorize(["Super_Admin", "Operations_Manager", "Area_Manager"]), registerUser);
router.post("/login", newlogin);
router.get("/logout", verifyToken, logout);
router.get("/getAllUsers", verifyTokenAndAuthorize(["Super_Admin", "Operations_Manager"]), getAllUsers);
router.post("/otpgenerate", otpGenerate);

module.exports = router;
