// ========================================
// DATABASE CONNECTION — db.js
// ========================================
// Creates and exports the SQLite database connection.
// On first run, creates the required tables and seeds
// product_stock from products.json.
//
// Tables:
//   orders        — ข้อมูลคำสั่งซื้อ
//   product_stock — stock ที่จัดการแบบ atomic (ป้องกัน Race Condition)
// ========================================

const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const fs      = require('fs');

const dbPath = path.resolve(__dirname, process.env.DB_PATH || './store.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the store.db SQLite database.');

        // Enable WAL mode for better concurrent read/write performance
        db.run('PRAGMA journal_mode=WAL');
        
        // -------------------------------------------------------
        // TABLE: orders — เก็บข้อมูลคำสั่งซื้อ
        // -------------------------------------------------------
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // -------------------------------------------------------
        // TABLE: product_stock — atomic stock management
        // -------------------------------------------------------
        // ใช้แทน stock ใน products.json เพื่อให้ UPDATE ... WHERE stock >= ?
        // ทำงานแบบ atomic ป้องกัน Race Condition (TOCTOU)
        db.run(`CREATE TABLE IF NOT EXISTS product_stock (
            product_id INTEGER PRIMARY KEY,
            stock INTEGER NOT NULL DEFAULT 0
        )`, (err) => {
            if (err) {
                console.error('Error creating product_stock table:', err.message);
                return;
            }

            // Seed product_stock from products.json if the table is empty
            db.get('SELECT COUNT(*) as count FROM product_stock', (err, row) => {
                if (err) {
                    console.error('Error checking product_stock:', err.message);
                    return;
                }
                if (row.count === 0) {
                    seedProductStock();
                } else {
                    console.log(`[DB] product_stock already has ${row.count} rows`);
                }
            });
        });
    }
});

// -------------------------------------------------------
// SEED — Load initial stock from products.json into SQLite
// -------------------------------------------------------
// This runs only once (when product_stock is empty).
// After seeding, SQLite is the single source of truth for stock.
function seedProductStock() {
    const productsPath = path.join(__dirname, 'products.json');
    try {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
        const stmt = db.prepare(
            'INSERT OR IGNORE INTO product_stock (product_id, stock) VALUES (?, ?)'
        );
        products.forEach(p => {
            stmt.run(p.id, p.stock || 0);
        });
        stmt.finalize(() => {
            console.log(`[DB] Seeded product_stock with ${products.length} products from products.json`);
        });
    } catch (e) {
        console.error('[DB] Error seeding product_stock:', e.message);
    }
}

module.exports = db;
