const connectDB = require("./config/db");
const { config, validateEnv } = require("./config/env");
const app = require("./app");

async function startServer() {
  try {
    validateEnv();
    await connectDB();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
