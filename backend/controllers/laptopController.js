const Laptop = require("../models/Laptop");
const { deleteUpload } = require("../utils/files");
const { buildLaptopQuery, normalizeLaptopPayload } = require("../utils/laptopValidation");

// Create Laptop
exports.createLaptop = async (req, res, next) => {
  try {
    const payload = normalizeLaptopPayload(req.body);

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const laptop = new Laptop({
      ...payload,
      image: imagePath,
    });

    const savedLaptop = await laptop.save();
    res.status(201).json(savedLaptop);
  } catch (err) {
    next(err);
  }
};

// Get all Laptops
exports.getLaptops = async (req, res, next) => {
  try {
    const { filters, sort } = buildLaptopQuery(req.query);
    const laptops = await Laptop.find(filters).sort(sort);
    res.json(laptops);
  } catch (err) {
    next(err);
  }
};

// Get single Laptop
exports.getLaptop = async (req, res, next) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) return res.status(404).json({ error: "Laptop not found" });
    res.json(laptop);
  } catch (err) {
    next(err);
  }
};

// Update Laptop
exports.updateLaptop = async (req, res, next) => {
  try {
    const payload = normalizeLaptopPayload(req.body, { partial: true });
    const existingLaptop = await Laptop.findById(req.params.id);
    if (!existingLaptop) return res.status(404).json({ error: "Laptop not found" });

    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Laptop.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (req.file && existingLaptop.image && existingLaptop.image !== updated.image) {
      await deleteUpload(existingLaptop.image);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete Laptop
exports.deleteLaptop = async (req, res, next) => {
  try {
    const deleted = await Laptop.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Laptop not found" });
    await deleteUpload(deleted.image);
    res.json({ message: "Laptop deleted successfully" });
  } catch (err) {
    next(err);
  }
};
