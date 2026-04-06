const fs = require("fs/promises");
const path = require("path");

async function deleteUpload(relativePath) {
  if (!relativePath) {
    return;
  }

  const normalized = relativePath.replace(/^\/+/, "");
  const targetPath = path.join(__dirname, "..", normalized);

  try {
    await fs.unlink(targetPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

module.exports = {
  deleteUpload,
};
