const express       = require("express");
const cors          = require("cors");
const { initDB }    = require("./db/database");
const contactRouter = require("./routes/contact");

const app  = express();
const PORT = 3001;

app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500", "null"],
  methods: ["GET", "POST", "DELETE"],
}));
app.use(express.json());

app.use("/api/contact", contactRouter);

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// initDB is async now, so we wait for it before listening
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌸 She Can Foundation API running at http://localhost:${PORT}`);
    console.log(`📋 View submissions: GET http://localhost:${PORT}/api/contact\n`);
  });
});