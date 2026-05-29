const express       = require("express");
const cors          = require("cors");
const path          = require("path");
const { initDB }    = require("./db/database");
const contactRouter = require("./routes/contact");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
}));
app.use(express.json());

// Serve frontend files from the ../frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/contact", contactRouter);

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// For any other route, serve index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌸 She Can Foundation running on port ${PORT}`);
  });
});