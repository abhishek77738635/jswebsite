const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const { ROOT_DIR } = require("../../loadEnv");

function resolveFromRoot(relativePath) {
  return path.isAbsolute(relativePath)
    ? relativePath
    : path.join(ROOT_DIR, relativePath);
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const resolved = resolveFromRoot(credPath);
    if (fs.existsSync(resolved)) {
      return require(resolved);
    }
  }

  return null;
}

try {
  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized with service account.");
  } else {
    admin.initializeApp();
    console.log("Firebase Admin initialized with default credentials.");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

const db = admin.firestore();

module.exports = { admin, db };
