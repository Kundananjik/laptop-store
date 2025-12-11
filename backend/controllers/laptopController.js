const Laptop = require("../models/Laptop");

// Create Laptop
exports.createLaptop = async (req, res) => {
  try {
    const { title, description, price, quantity } = req.body;
    if (!title || price === undefined) {
      return res.status(400).json({ error: "Title and price required" });
    }

    // Handle image
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const laptop = new Laptop({
      title,
      description,
      price,
      quantity,
      image: imagePath,
    });

    const savedLaptop = await laptop.save();
    res.status(201).json(savedLaptop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all Laptops
exports.getLaptops = async (req, res) => {
  try {
    const laptops = await Laptop.find();
    res.json(laptops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single Laptop
exports.getLaptop = async (req, res) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) return res.status(404).json({ error: "Laptop not found" });
    res.json(laptop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Laptop
exports.updateLaptop = async (req, res) => {
  try {
    const updated = await Laptop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Laptop not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Laptop
exports.deleteLaptop = async (req, res) => {
  try {
    const deleted = await Laptop.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Laptop not found" });
    res.json({ message: "Laptop deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
