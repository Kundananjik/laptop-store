const express = require("express");
const controller = require("../controllers/adminController");

const router = express.Router();

router.post("/login", controller.login);
router.get("/session", controller.session);

module.exports = router;
