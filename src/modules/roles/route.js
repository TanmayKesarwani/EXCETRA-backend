const express = require("express");
const router = express.Router();
const {
    updateRole,
    assignAreaManager
} = require("./controller");
const {
    verifyToken,
    verifyTokenAndAuthorize,
} = require("../../middleware/auth");

router.put("/updateRole/:id", [verifyToken, verifyTokenAndAuthorize(["Super_Admin", "Operations_Manager"])], updateRole);
router.put("/assignArea/:id", [verifyToken, verifyTokenAndAuthorize(["Super_Admin", "Operations_Manager"])], assignAreaManager);

module.exports = router;