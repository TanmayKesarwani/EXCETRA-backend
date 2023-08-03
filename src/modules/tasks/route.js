const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTask, updateTask, getAssignee, taskPayment } = require("./controller");
const {
  verifyToken,
  verifyTokenAndAuthorize,
} = require("../../middleware/auth");

router.post("/", verifyTokenAndAuthorize(["client", "Area_Manager", "Super_Admin"]), createTask);
router.get("/", verifyToken, getTasks);
router.get("/:id", verifyToken, getTask);
router.get("/getAssignee/:id", verifyTokenAndAuthorize(["Area_Manager", "Super_Admin"]), getAssignee);
router.put("/:id", verifyToken, updateTask);

module.exports = router;