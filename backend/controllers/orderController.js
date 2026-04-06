const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Laptop = require("../models/Laptop");
const { getSessionId } = require("../utils/session");

function normalizeCustomer(customer = {}) {
  const normalized = {
    fullName: String(customer.fullName || "").trim(),
    email: String(customer.email || "").trim().toLowerCase(),
    phone: String(customer.phone || "").trim(),
    address: String(customer.address || "").trim(),
  };

  if (!normalized.fullName || !normalized.email || !normalized.phone || !normalized.address) {
    const error = new Error("Customer fullName, email, phone, and address are required");
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

exports.checkout = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const customer = normalizeCustomer(req.body.customer);
    const cart = await Cart.findOne({ sessionId }).populate("items.laptop");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const missingItem = cart.items.find((item) => !item.laptop);
    if (missingItem) {
      return res.status(400).json({ error: "Cart contains unavailable products" });
    }

    for (const item of cart.items) {
      if (item.laptop.quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.laptop.title}`,
        });
      }
    }

    for (const item of cart.items) {
      item.laptop.quantity -= item.quantity;
      await item.laptop.save();
    }

    const orderItems = cart.items.map((item) => ({
      laptop: item.laptop._id,
      title: item.laptop.title,
      brand: item.laptop.brand,
      image: item.laptop.image || "",
      price: item.laptop.price,
      quantity: item.quantity,
    }));

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      sessionId,
      items: orderItems,
      customer,
      total,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({
      orderId: order._id.toString(),
      total: order.total,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      status: order.status,
      createdAt: order.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

exports.listSessionOrders = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const orders = await Order.find({ sessionId }).sort({ createdAt: -1 }).limit(10);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};
