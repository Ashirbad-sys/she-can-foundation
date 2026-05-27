// database.js — SQLite via sql.js (pure JavaScript, no C++ needed)

const path = require("path");
const fs   = require("fs");
const DB_PATH = path.join(__dirname, "contacts.db");

let db;

async function initDB() {
  // sql.js loads asynchronously
  const initSqlJs = require("sql.js");
  const SQL = await initSqlJs();

  // If a saved database file exists, load it — otherwise start fresh
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create the contacts table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name  TEXT NOT NULL,
      email      TEXT NOT NULL,
      message    TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Save to disk right away
  saveDB();
  console.log("✅ Database ready at:", DB_PATH);
}

// sql.js works in memory — we save to disk after every write
function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function getDB() { return db; }

module.exports = { initDB, getDB, saveDB };