const dotenv = require("dotenv");
const { hashPassword } = require("../utils/passwords");

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword(process.env.ADMIN_PASSWORD || "change-me"),
  adminSecret: process.env.ADMIN_SECRET || "dev-admin-secret",
};

function validateEnv() {
  if (!config.mongoUri) {
    throw new Error("MONGO_URI is required");
  }
}

module.exports = {
  config,
  validateEnv,
};
