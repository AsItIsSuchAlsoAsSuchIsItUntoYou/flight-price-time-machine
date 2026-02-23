require('dotenv').config();
const amadeus = require('./amadeus');
const db = require('./db');

// Major hubs to discover routes from
const HUB_AIRPORTS = ['JFK', 'LAX', 'ORD', 'DFW', 'ATL', 'SFO', 'MIA', 'BOS', 'SEA', 'DEN'];

const discoverRoutes = async () => {
  console.log('[discover] Starting route discovery...');
  let added = 0;
  let skipped = 0;

  for (const origin of HUB_AIRPORTS) {
    try {
      const response = await amadeus.airport.directDestinations.get({
        departureAirportCode: origin,
      });

      const destinations = response.data;
      console.log(`[discover] Found ${destinations.length} destinations from ${origin}`);

      for (const dest of destinations) {
        const destination = dest.iataCode;
        if (!destination || destination === origin) continue;

        try {
          const result = await db.query(
            `INSERT INTO tracked_routes (origin, destination, tier)
             VALUES ($1, $2, 3)
             ON CONFLICT (origin, destination) DO NOTHING
             RETURNING id`,
            [origin, destination]
          );

          if (result.rows.length > 0) {
            added++;
          } else {
            skipped++;
          }
        } catch (dbErr) {
          console.error(`[discover] DB error for ${origin} → ${destination}:`, dbErr.message);
        }
      }
    } catch (err) {
      console.error(`[discover] Failed to get destinations for ${origin}:`, err.message);
    }
  }

  console.log(`[discover] Done. Added ${added} new routes, skipped ${skipped} existing.`);
  process.exit(0);
};

discoverRoutes();