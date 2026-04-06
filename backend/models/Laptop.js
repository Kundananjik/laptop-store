const mongoose = require("mongoose");

const LaptopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["gaming", "business", "ultrabook", "student", "creator", "general"],
    },
    processor: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    ramGb: {
      type: Number,
      required: true,
      min: 1,
    },
    storageGb: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

LaptopSchema.index({ title: "text", brand: "text", processor: "text", description: "text" });
LaptopSchema.index({ category: 1, brand: 1, price: 1 });

module.exports = mongoose.model("Laptop", LaptopSchema);
