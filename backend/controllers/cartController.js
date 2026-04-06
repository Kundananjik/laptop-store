const Cart = require("../models/Cart");
const Laptop = require("../models/Laptop");
const { mapCart } = require("../utils/cart");
const { getSessionId } = require("../utils/session");

async function loadCart(sessionId) {
  let cart = await Cart.findOne({ sessionId }).populate("items.laptop");

  if (!cart) {
    cart = await Cart.create({ sessionId, items: [] });
    cart = await Cart.findById(cart._id).populate("items.laptop");
  }

  cart.items = cart.items.filter((item) => item.laptop);
  if (cart.isModified("items")) {
    await cart.save();
  }

  return cart;
}

exports.getCart = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const cart = await loadCart(sessionId);
    res.json(mapCart(cart));
  } catch (error) {
    next(error);
  }
};

exports.addCartItem = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const laptopId = String(req.body.laptopId || "").trim();
    const quantity = Number(req.body.quantity || 1);

    if (!laptopId) {
      return res.status(400).json({ error: "laptopId is required" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: "quantity must be a positive integer" });
    }

    const laptop = await Laptop.findById(laptopId);
    if (!laptop) {
      return res.status(404).json({ error: "Laptop not found" });
    }

    if (laptop.quantity < quantity) {
      return res.status(400).json({ error: "Requested quantity exceeds available stock" });
    }

    const cart = await loadCart(sessionId);
    const existingItem = cart.items.find((item) => item.laptop._id.toString() === laptopId);

    if (existingItem) {
      if (existingItem.quantity + quantity > laptop.quantity) {
        return res.status(400).json({ error: "Requested quantity exceeds available stock" });
      }
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ laptop: laptop._id, quantity });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate("items.laptop");
    res.status(201).json(mapCart(updatedCart));
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: "quantity must be a positive integer" });
    }

    const cart = await loadCart(sessionId);
    const item = cart.items.id(req.params.itemId);

    if (!item || !item.laptop) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    if (item.laptop.quantity < quantity) {
      return res.status(400).json({ error: "Requested quantity exceeds available stock" });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items.laptop");
    res.json(mapCart(updatedCart));
  } catch (error) {
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const cart = await loadCart(sessionId);
    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    item.deleteOne();
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items.laptop");
    res.json(mapCart(updatedCart));
  } catch (error) {
    next(error);
  }
};
