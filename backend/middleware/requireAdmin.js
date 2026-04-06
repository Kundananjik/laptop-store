const { extractBearerToken, verifyAdminToken } = require("../utils/adminAuth");

function requireAdmin(req, res, next) {
  const token = extractBearerToken(req);
  const payload = verifyAdminToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Admin authentication required" });
  }

  req.admin = payload;
  next();
}

module.exports = {
  requireAdmin,
};
