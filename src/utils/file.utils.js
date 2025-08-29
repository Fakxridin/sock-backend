const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

function absoluteUploadPath(fileName) {
  if (!fileName) return null;
  // Path traversal’ni bloklash
  const abs = path.join(UPLOAD_DIR, path.basename(fileName));
  if (!abs.startsWith(UPLOAD_DIR)) return null;
  return abs;
}

function deleteIfExists(fileName) {
  try {
    const abs = absoluteUploadPath(fileName);
    if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (_) {}
}

module.exports = { UPLOAD_DIR, absoluteUploadPath, deleteIfExists };
