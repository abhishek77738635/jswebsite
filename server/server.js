require("../loadEnv");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const { verifyToken } = require("./middleware/auth");
const { config: cashfreeConfig, logCashfreeConfigOnBoot } = require("./lib/cashfree");
logCashfreeConfigOnBoot();

/** Public — confirm Cashfree mode when debugging local/production */
app.get("/api/payment/config", (req, res) => {
  res.json({
    success: true,
    data: {
      mode: cashfreeConfig.mode,
      isProduction: cashfreeConfig.isProduction,
      clientIdPrefix: cashfreeConfig.clientId.slice(0, 12),
    },
  });
});

app.use("/api", verifyToken);

const questionsRouter = require("./routes/questions");
const categoriesRouter = require("./routes/categories");
const seedRouter = require("./routes/seed");
const paymentRouter = require("./routes/payment");
const userRouter = require("./routes/user");

app.use("/api/questions", questionsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/seed", seedRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Upchallenges API");
});

app.get("/api/health", (req, res) => {
  const { getTtlSeconds } = require("./lib/cache");
  res.json({
    ok: true,
    cache: {
      ttlSeconds: getTtlSeconds(),
      redis: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    },
  });
});

module.exports = app;

const PORT = process.env.PORT || 5000;

// Start HTTP server only when this file is executed directly.
// This keeps local dev reliable even if a VERCEL env var is present,
// while still allowing serverless imports from api/index.js.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
