const express = require("express");
const controller = require("../controllers/cartController");

const router = express.Router();

router.get("/", controller.getCart);
router.post("/items", controller.addCartItem);
router.put("/items/:itemId", controller.updateCartItem);
router.delete("/items/:itemId", controller.removeCartItem);

module.exports = router;
