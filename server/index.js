require('dotenv').config();

const express = require('express');
const cors = require('cors');
const amadeus = require('./amadeus');

const cron = require('node-cron');
const snapshotPrices = require('./snapshotService');

// Run once immediately on server start so you get data right away
snapshotPrices();

// Then run every day at 8am
cron.schedule('0 8 * * *', () => {
  snapshotPrices();
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/test-amadeus', async (req, res) => {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: 'JFK',
      destinationLocationCode: 'LAX',
      departureDate: '2026-03-15',
      adults: '1',
      max: '5',
      currencyCode: 'USD',
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const db = require('./db');

app.post('/snapshots', async (req, res) => {
  const { origin, destination, departure_date, price, carrier_code } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO price_snapshots (origin, destination, departure_date, price, carrier_code)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [origin, destination, departure_date, price, carrier_code]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/snapshots', async (req, res) => {
  const { origin, destination, departure_date } = req.query;
  try {
    const result = await db.query(
      `SELECT * FROM price_snapshots
       WHERE origin = $1 AND destination = $2 AND departure_date = $3
       ORDER BY fetched_at ASC`,
      [origin, destination, departure_date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/alerts', async (req, res) => {
  const { email, origin, destination, target_price } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO price_alerts (email, origin, destination, target_price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [email, origin, destination, target_price]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/alerts', async (req, res) => {
  const { origin, destination } = req.query;
  try {
    const result = await db.query(
      `SELECT * FROM price_alerts WHERE origin = $1 AND destination = $2`,
      [origin, destination]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));