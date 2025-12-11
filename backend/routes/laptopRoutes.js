const express = require("express");
const router = express.Router();
const controller = require("../controllers/laptopController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Initialize upload middleware
const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), controller.createLaptop);
router.get("/", controller.getLaptops);
router.get("/:id", controller.getLaptop);
router.put("/:id", controller.updateLaptop);
router.delete("/:id", controller.deleteLaptop);

module.exports = router;
