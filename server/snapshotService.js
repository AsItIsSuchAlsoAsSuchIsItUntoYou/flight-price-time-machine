const amadeus = require('./amadeus');
const db = require('./db');
const sendPriceAlert = require('./emailService');

// Departure dates to check per route - spread across near and mid future
const DEPARTURE_DATES = [
  getFutureDate(14),
  getFutureDate(30),
  getFutureDate(60),
];

function getFutureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

const shouldFetchRoute = (route, tier) => {
  if (!route.last_fetched_at) return true;

  const now = new Date();
  const lastFetched = new Date(route.last_fetched_at);
  const hoursSince = (now - lastFetched) / (1000 * 60 * 60);

  if (tier === 1) return hoursSince >= 24;
  if (tier === 2) return hoursSince >= 72;
  if (tier === 3) return hoursSince >= 168;
  return false;
};

const snapshotPrices = async () => {
  console.log(`[cron] Running price snapshot at ${new Date().toISOString()}`);

  const { rows: routes } = await db.query(
    `SELECT * FROM tracked_routes ORDER BY tier ASC, last_fetched_at ASC NULLS FIRST`
  );

  console.log(`[cron] ${routes.length} routes to evaluate`);
  let fetched = 0;

  for (const route of routes) {
    if (!shouldFetchRoute(route, route.tier)) continue;

    for (const departureDate of DEPARTURE_DATES) {
      try {
        const response = await amadeus.shopping.flightOffersSearch.get({
          originLocationCode: route.origin,
          destinationLocationCode: route.destination,
          departureDate,
          adults: '1',
          max: '5',
          currencyCode: 'USD',
        });

        const offers = response.data;
        if (!offers || offers.length === 0) continue;

        const lowest = offers.reduce((min, offer) => {
          const price = parseFloat(offer.price.total);
          return price < min.price
            ? { price, carrierCode: offer.validatingAirlineCodes[0] }
            : min;
        }, { price: Infinity, carrierCode: null });

        await db.query(
          `INSERT INTO price_snapshots (origin, destination, departure_date, price, carrier_code)
           VALUES ($1, $2, $3, $4, $5)`,
          [route.origin, route.destination, departureDate, lowest.price, lowest.carrierCode]
        );

        // Check alerts
        const alerts = await db.query(
          `SELECT * FROM price_alerts WHERE origin = $1 AND destination = $2 AND target_price >= $3`,
          [route.origin, route.destination, lowest.price]
        );

        for (const alert of alerts.rows) {
          try {
            await sendPriceAlert({
              email: alert.email,
              origin: route.origin,
              destination: route.destination,
              price: lowest.price,
              targetPrice: alert.target_price,
            });
            console.log(`[cron] Alert sent to ${alert.email}`);
          } catch (emailErr) {
            console.error(`[cron] Email failed:`, emailErr.message);
          }
        }

        fetched++;
      } catch (err) {
        console.error(`[cron] Failed for ${route.origin} → ${route.destination} on ${departureDate}:`, err.message);
      }
    }

    // Update last_fetched_at for this route
    await db.query(
      `UPDATE tracked_routes SET last_fetched_at = NOW() WHERE id = $1`,
      [route.id]
    );
  }

  console.log(`[cron] Snapshot complete. Fetched ${fetched} price points.`);
};

module.exports = snapshotPrices;