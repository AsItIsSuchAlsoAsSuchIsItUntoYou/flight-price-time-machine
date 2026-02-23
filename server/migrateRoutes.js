require('dotenv').config();
const pool = require('./db');

const migrate = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracked_routes (
      id SERIAL PRIMARY KEY,
      origin VARCHAR(3) NOT NULL,
      destination VARCHAR(3) NOT NULL,
      tier INTEGER NOT NULL DEFAULT 2,
      last_fetched_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(origin, destination)
    );
  `);
  console.log('Routes table created successfully');
  process.exit(0);
};

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});