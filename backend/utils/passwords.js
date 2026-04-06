const crypto = require("crypto");

const SCRYPT_KEYLEN = 64;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

function verifyPassword(password, storedValue) {
  if (!storedValue || typeof storedValue !== "string") {
    return false;
  }

  if (!storedValue.startsWith("scrypt$")) {
    return false;
  }

  const [, salt, expectedHash] = storedValue.split("$");
  if (!salt || !expectedHash) {
    return false;
  }

  const derivedHash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  const derivedBuffer = Buffer.from(derivedHash, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  if (derivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedBuffer, expectedBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
