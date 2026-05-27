const express = require("express");
const router  = express.Router();
const { getDB, saveDB }   = require("../db/database");
const { validateContact } = require("../middleware/validate");

// ── POST: save new submission ─────────────────────────────────
router.post("/", (req, res) => {
  const { full_name, email, message } = req.body;

  const { valid, errors } = validateContact({ full_name, email, message });
  if (!valid) return res.status(400).json({ success: false, errors });

  try {
    const db = getDB();
    db.run(
      "INSERT INTO contacts (full_name, email, message) VALUES (?, ?, ?)",
      [full_name.trim(), email.trim().toLowerCase(), message.trim()]
    );

    // Get the id of the row we just inserted
    const result = db.exec("SELECT last_insert_rowid() as id");
    const id = result[0].values[0][0];

    saveDB(); // persist to disk

    return res.status(201).json({
      success: true,
      message: "Form Submitted Successfully",
      id,
    });
  } catch (err) {
    console.error("DB insert error:", err);
    return res.status(500).json({ success: false, errors: ["Server error. Please try again."] });
  }
});

// ── GET: fetch all submissions ────────────────────────────────
router.get("/", (req, res) => {
  try {
    const db     = getDB();
    const result = db.exec("SELECT * FROM contacts ORDER BY id DESC");

    // sql.js returns columns + values separately — we combine them into objects
    if (!result.length) return res.json({ success: true, count: 0, data: [] });

    const { columns, values } = result[0];
    const data = values.map(row =>
      Object.fromEntries(columns.map((col, i) => [col, row[i]]))
    );

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, errors: ["Could not fetch submissions."] });
  }
});

// ── DELETE: remove one submission ────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const db = getDB();
    db.run("DELETE FROM contacts WHERE id = ?", [req.params.id]);
    saveDB();
    return res.json({ success: true, message: "Deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, errors: ["Could not delete."] });
  }
});

module.exports = router;