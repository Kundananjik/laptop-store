const mongoose = require("mongoose");

const LaptopSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String }, // store filename/path
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Laptop", LaptopSchema);
