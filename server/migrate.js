require('dotenv').config();
const pool = require('./db');

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS price_snapshots (
      id SERIAL PRIMARY KEY,
      origin VARCHAR(3) NOT NULL,
      destination VARCHAR(3) NOT NULL,
      departure_date DATE NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      carrier_code VARCHAR(10),
      fetched_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS price_alerts (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      origin VARCHAR(3) NOT NULL,
      destination VARCHAR(3) NOT NULL,
      target_price NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Tables created successfully');
  process.exit(0);
};

createTables().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});