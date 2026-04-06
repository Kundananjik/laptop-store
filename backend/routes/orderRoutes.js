const express = require("express");
const controller = require("../controllers/orderController");
const adminController = require("../controllers/orderAdminController");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = express.Router();

router.get("/", controller.listSessionOrders);
router.get("/admin", requireAdmin, adminController.listOrders);
router.post("/checkout", controller.checkout);

module.exports = router;
