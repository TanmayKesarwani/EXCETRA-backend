const express = require("express");
const router = express.Router();
const {
    registerClient,
    clientLogin,
    clientLogout,
    getALLClient,
    getClient

} = require("./controller");
const {
    verifyToken,
    verifyTokenAndAuthorize,
} = require("../../middleware/auth");

router.post("/registerClient", registerClient);
router.post("/loginClient", clientLogin);
router.get("/logoutClient", verifyToken, clientLogout);
router.get("/:id", getClient);
router.get("/getALLClient", [verifyToken, verifyTokenAndAuthorize(["Super_Admin", "Operations_Manager", "Area_Manager"])], getALLClient);


module.exports = router;
