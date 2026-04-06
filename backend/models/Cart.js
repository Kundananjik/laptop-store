const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    laptop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Laptop",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: true }
);

const CartSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
