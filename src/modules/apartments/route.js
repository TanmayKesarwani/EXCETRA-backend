const express = require("express");
const router = express.Router();
const {
    addApartment, getAllApartment, assignAreaManager, getAppartment

} = require("./controller");

const {
    verifyToken,
    verifyTokenAndAuthorize,
} = require("../../middleware/auth");

router.post("/", verifyToken, addApartment);
router.get("/", getAllApartment);
router.get("/:id", getAppartment);
router.put("/:id", verifyTokenAndAuthorize(["Super_Admin", "Operations_Manager"]), assignAreaManager);



module.exports = router;