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
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON."
      );
    }
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const resolved = resolveFromRoot(credPath);
    if (fs.existsSync(resolved)) {
      return require(resolved);
    }
    if (process.env.VERCEL) {
      throw new Error(
        "On Vercel use FIREBASE_SERVICE_ACCOUNT_JSON (full JSON), not a file path. " +
          "Remove GOOGLE_APPLICATION_CREDENTIALS from Vercel env vars."
      );
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
  } else if (process.env.VERCEL) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_JSON on Vercel. " +
        "Paste your Firebase service account JSON as one line in Project Settings → Environment Variables."
    );
  } else {
    admin.initializeApp();
    console.log("Firebase Admin initialized with default credentials.");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error.message);
  throw error;
}

const db = admin.firestore();

module.exports = { admin, db };
