const express = require("express");
const router = express.Router();
const userRouter = require("../modules/users/route");
const clientRouter = require("../modules/clientUser/route")
const apartmentRouter = require("../modules/apartments/route")
const roleRouter = require("../modules/roles/route")
const taskRouter = require("../modules/tasks/route");

router.use("/user", userRouter);
router.use("/client", clientRouter);
router.use("/apartment", apartmentRouter);
router.use("/role", roleRouter);
router.use("/task", taskRouter);

module.exports = router;
