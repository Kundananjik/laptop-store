const express = require("express");
const cors = require("cors");
const path = require("path");
const { config } = require("./config/env");
const { requestLogger } = require("./utils/logger");
const laptopRoutes = require("./routes/laptopRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const frontendDir = path.join(__dirname, "..", "frontend");

app.use(requestLogger);
app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(frontendDir));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/laptops", laptopRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(frontendDir, "admin.html"));
});

app.get("/product", (req, res) => {
  res.sendFile(path.join(frontendDir, "product.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((error, req, res, next) => {
  if (error.name === "CastError") {
    res.status(400).json({
      error: "Invalid identifier",
    });
    return;
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message || "Internal server error",
  });
});

module.exports = app;
