// src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'foodsflow.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize tables
const initializeDatabase = () => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Notifications table
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample notifications
  db.get("SELECT COUNT(*) as count FROM notifications", (err, row) => {
    if (row.count === 0) {
      const sampleNotifications = [
        ['Welcome to FoodsFlow! 🛒', 'Thank you for joining FoodsFlow!', 'welcome', 0, 'high'],
        ['Special Offer 🎉', 'Get 20% off on your first order', 'promotion', 0, 'medium'],
        ['New Features ✨', 'We added express delivery!', 'update', 1, 'low']
      ];

      const stmt = db.prepare(`INSERT INTO notifications (title, message, type, is_read, priority) VALUES (?, ?, ?, ?, ?)`);
      
      sampleNotifications.forEach(notification => {
        stmt.run(notification);
      });
      
      stmt.finalize();
      console.log('📝 Sample notifications inserted');
    }
  });
};

// Promise wrapper for easier use
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

module.exports = {
  db,
  dbAll,
  dbRun,
  dbGet
};