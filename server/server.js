require("../loadEnv");

const express = require("express");
const cors = require("cors");

const app = express();

// Vercel serverless may forward paths without the /api prefix
if (process.env.VERCEL) {
  app.use((req, _res, next) => {
    if (!req.url.startsWith("/api")) {
      req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
    }
    next();
  });
}

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const { verifyToken } = require("./middleware/auth");
app.use("/api", verifyToken);

const questionsRouter = require("./routes/questions");
const categoriesRouter = require("./routes/categories");
const seedRouter = require("./routes/seed");
const paymentRouter = require("./routes/payment");

app.use("/api/questions", questionsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/seed", seedRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("JS Interview API");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

module.exports = app;

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
