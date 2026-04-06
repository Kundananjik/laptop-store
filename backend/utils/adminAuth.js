const crypto = require("crypto");
const { config } = require("../config/env");

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function createAdminToken() {
  const payload = {
    role: "admin",
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const payloadValue = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", config.adminSecret)
    .update(payloadValue)
    .digest("base64url");

  return `${payloadValue}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [payloadValue, signature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", config.adminSecret)
    .update(payloadValue)
    .digest("base64url");

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(payloadValue));
  if (payload.role !== "admin" || typeof payload.exp !== "number" || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice("Bearer ".length).trim();
}

module.exports = {
  createAdminToken,
  extractBearerToken,
  safeCompare,
  verifyAdminToken,
};
