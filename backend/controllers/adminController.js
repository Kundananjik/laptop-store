const { config } = require("../config/env");
const { createAdminToken, extractBearerToken, verifyAdminToken } = require("../utils/adminAuth");
const { verifyPassword } = require("../utils/passwords");

exports.login = async (req, res) => {
  const password = String(req.body.password || "");

  if (!password) {
    return res.status(400).json({ error: "password is required" });
  }

  const passwordMatches = verifyPassword(password, config.adminPasswordHash);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  res.json({
    token: createAdminToken(),
  });
};

exports.session = async (req, res) => {
  const token = extractBearerToken(req);
  const payload = verifyAdminToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired admin session" });
  }

  res.json({ authenticated: true });
};
