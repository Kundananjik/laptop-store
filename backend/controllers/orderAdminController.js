const Order = require("../models/Order");

exports.listOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};
