const path = require("path");
const dotenv = require("dotenv");

const ROOT_DIR = path.resolve(__dirname);
const envPath = path.join(ROOT_DIR, ".env");

dotenv.config({ path: envPath });

module.exports = { ROOT_DIR, envPath };
