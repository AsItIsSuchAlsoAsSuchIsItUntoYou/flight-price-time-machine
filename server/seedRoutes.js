require('dotenv').config();
const db = require('./db');

const SEED_ROUTES = [
  // Tier 1 - Busiest US domestic routes (daily)
  { origin: 'JFK', destination: 'LAX', tier: 1 },
  { origin: 'LAX', destination: 'JFK', tier: 1 },
  { origin: 'SFO', destination: 'JFK', tier: 1 },
  { origin: 'JFK', destination: 'SFO', tier: 1 },
  { origin: 'ORD', destination: 'LAX', tier: 1 },
  { origin: 'LAX', destination: 'ORD', tier: 1 },
  { origin: 'ATL', destination: 'LAX', tier: 1 },
  { origin: 'LAX', destination: 'ATL', tier: 1 },
  { origin: 'DFW', destination: 'JFK', tier: 1 },
  { origin: 'JFK', destination: 'MIA', tier: 1 },
  { origin: 'BOS', destination: 'LAX', tier: 1 },
  { origin: 'SEA', destination: 'JFK', tier: 1 },
  { origin: 'ORD', destination: 'MIA', tier: 1 },
  { origin: 'DEN', destination: 'JFK', tier: 1 },
  { origin: 'LAS', destination: 'JFK', tier: 1 },

  // Tier 2 - Popular secondary domestic + international (every 3 days)
  { origin: 'JFK', destination: 'LHR', tier: 2 },
  { origin: 'JFK', destination: 'CDG', tier: 2 },
  { origin: 'JFK', destination: 'NRT', tier: 2 },
  { origin: 'LAX', destination: 'LHR', tier: 2 },
  { origin: 'LAX', destination: 'NRT', tier: 2 },
  { origin: 'SFO', destination: 'LHR', tier: 2 },
  { origin: 'JFK', destination: 'CUN', tier: 2 },
  { origin: 'ORD', destination: 'LHR', tier: 2 },
  { origin: 'ATL', destination: 'LHR', tier: 2 },
  { origin: 'MIA', destination: 'LHR', tier: 2 },
  { origin: 'DFW', destination: 'LAX', tier: 2 },
  { origin: 'PHX', destination: 'JFK', tier: 2 },
  { origin: 'MSP', destination: 'LAX', tier: 2 },
  { origin: 'DTW', destination: 'LAX', tier: 2 },
  { origin: 'CLT', destination: 'LAX', tier: 2 },

  // Tier 3 - Less common but interesting routes (weekly)
  { origin: 'JFK', destination: 'DXB', tier: 3 },
  { origin: 'JFK', destination: 'SYD', tier: 3 },
  { origin: 'LAX', destination: 'SYD', tier: 3 },
  { origin: 'LAX', destination: 'CDG', tier: 3 },
  { origin: 'SFO', destination: 'NRT', tier: 3 },
  { origin: 'JFK', destination: 'BCN', tier: 3 },
  { origin: 'JFK', destination: 'FCO', tier: 3 },
  { origin: 'ORD', destination: 'NRT', tier: 3 },
  { origin: 'MIA', destination: 'CUN', tier: 3 },
  { origin: 'LAX', destination: 'MEX', tier: 3 },
];

const seed = async () => {
  let inserted = 0;
  let skipped = 0;

  for (const route of SEED_ROUTES) {
    try {
      await db.query(
        `INSERT INTO tracked_routes (origin, destination, tier)
         VALUES ($1, $2, $3)
         ON CONFLICT (origin, destination) DO NOTHING`,
        [route.origin, route.destination, route.tier]
      );
      inserted++;
    } catch (err) {
      console.error(`Failed to insert ${route.origin} → ${route.destination}:`, err.message);
      skipped++;
    }
  }

  console.log(`Seeded ${inserted} routes, skipped ${skipped} duplicates`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});