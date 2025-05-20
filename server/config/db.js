// server/config/db.js

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../db/qrbox.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

module.exports = db;
