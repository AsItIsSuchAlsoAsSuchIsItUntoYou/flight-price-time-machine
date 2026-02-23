const amadeus = require('./amadeus');
const db = require('./db');
const TRACKED_ROUTES = require('./routes');

const snapshotPrices = async () => {
  console.log(`[cron] Running price snapshot at ${new Date().toISOString()}`);

  for (const route of TRACKED_ROUTES) {
    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: route.origin,
        destinationLocationCode: route.destination,
        departureDate: route.departureDate,
        adults: '1',
        max: '5',
        currencyCode: 'USD',
      });

      const offers = response.data;
      if (!offers || offers.length === 0) {
        console.log(`[cron] No offers found for ${route.origin} → ${route.destination}`);
        continue;
      }

      // Find the lowest price among the offers
      const lowest = offers.reduce((min, offer) => {
        const price = parseFloat(offer.price.total);
        return price < min.price
          ? { price, carrierCode: offer.validatingAirlineCodes[0] }
          : min;
      }, { price: Infinity, carrierCode: null });

      await db.query(
        `INSERT INTO price_snapshots (origin, destination, departure_date, price, carrier_code)
         VALUES ($1, $2, $3, $4, $5)`,
        [route.origin, route.destination, route.departureDate, lowest.price, lowest.carrierCode]
      );

      console.log(`[cron] Saved $${lowest.price} for ${route.origin} → ${route.destination}`);

    } catch (err) {
      console.error(`[cron] Failed for ${route.origin} → ${route.destination}:`, err.message);
    }
  }

  console.log('[cron] Snapshot complete');
};

module.exports = snapshotPrices;