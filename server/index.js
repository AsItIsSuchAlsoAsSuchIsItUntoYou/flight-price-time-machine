require('dotenv').config();

const express = require('express');
const cors = require('cors');
const amadeus = require('./amadeus');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));