import pg from "pg";

const client = new pg.Client({
  user: "AAA",
  host: "localhost",
  database: "hatirla",
  password: "AAA2025",
  port: 5432,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected.");

    //
    // RESET (FK sırası önemli)
    //
    await client.query(`TRUNCATE "Experience", "Flight", "Hotel", "City" RESTART IDENTITY CASCADE;`);
    console.log("Tables cleared.");

    //
    // 1) CITIES (10 adet)
    //
    const cities = [
      { name: "Istanbul", countryCode: "TR" },
      { name: "Paris", countryCode: "FR" },
      { name: "Dubai", countryCode: "AE" },
      { name: "Tokyo", countryCode: "JP" },
      { name: "New York", countryCode: "US" },
      { name: "Rome", countryCode: "IT" },
      { name: "Bali", countryCode: "ID" },
      { name: "Bangkok", countryCode: "TH" },
      { name: "Seoul", countryCode: "KR" },
      { name: "Amsterdam", countryCode: "NL" },
    ];

    const cityIds = [];

    for (const c of cities) {
      const result = await client.query(
        `INSERT INTO "City" (name, countryCode) VALUES ($1, $2) RETURNING id`,
        [c.name, c.countryCode]
      );
      cityIds.push({ name: c.name, id: result.rows[0].id });
    }

    console.log("Cities OK.");

    const getCityId = (name) => cityIds.find((c) => c.name === name)?.id;

    //
    // 2) HOTELS (20 adet — şemana göre)
    //
    const hotels = [
      { name: "Istanbul Palace", city: "Istanbul", slug: "istanbul-palace", starRating: 5, minPrice: 2000 },
      { name: "Paris Boutique", city: "Paris", slug: "paris-boutique", starRating: 4, minPrice: 1800 },
      { name: "Dubai Marina Suites", city: "Dubai", slug: "dubai-marina", starRating: 5, minPrice: 2500 },
      { name: "Tokyo Sky Tower Hotel", city: "Tokyo", slug: "tokyo-sky", starRating: 5, minPrice: 2600 },
      { name: "NYC Central Hotel", city: "New York", slug: "nyc-central", starRating: 4, minPrice: 2200 },

      { name: "Rome Antique Stay", city: "Rome", slug: "rome-antique", starRating: 4, minPrice: 1700 },
      { name: "Bali Beach Resort", city: "Bali", slug: "bali-beach", starRating: 5, minPrice: 1500 },
      { name: "Bangkok Chill Resort", city: "Bangkok", slug: "bangkok-chill", starRating: 4, minPrice: 1200 },
      { name: "Seoul River Suites", city: "Seoul", slug: "seoul-river", starRating: 4, minPrice: 1600 },
      { name: "Amsterdam Canal Hotel", city: "Amsterdam", slug: "ams-canal", starRating: 4, minPrice: 1900 },
    ];

    for (const h of hotels) {
      await client.query(
        `INSERT INTO "Hotel" 
         (name, slug, cityId, starRating, minPrice) 
         VALUES ($1, $2, $3, $4, $5)`,
        [h.name, h.slug, getCityId(h.city), h.starRating, h.minPrice]
      );
    }

    console.log("Hotels OK.");

    //
    // 3) FLIGHTS (20 adet)
    //
    const now = new Date();
    const flights = [
      { from: "Istanbul", to: "Dubai", carrier: "TK", num: "TK202" },
      { from: "Paris", to: "Tokyo", carrier: "AF", num: "AF88" },
      { from: "Dubai", to: "New York", carrier: "EK", num: "EK201" },
      { from: "Tokyo", to: "Seoul", carrier: "JL", num: "JL91" },
      { from: "New York", to: "Amsterdam", carrier: "DL", num: "DL48" },

      { from: "Rome", to: "Istanbul", carrier: "AZ", num: "AZ702" },
      { from: "Bangkok", to: "Bali", carrier: "TG", num: "TG431" },
      { from: "Seoul", to: "Tokyo", carrier: "KE", num: "KE703" },
      { from: "Amsterdam", to: "Paris", carrier: "KL", num: "KL1234" },
      { from: "Dubai", to: "Bangkok", carrier: "EK", num: "EK374" },
    ];

    for (const f of flights) {
      await client.query(
        `INSERT INTO "Flight"
         (fromCityId, toCityId, carrierCode, flightNumber, departureTime, arrivalTime)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          getCityId(f.from),
          getCityId(f.to),
          f.carrier,
          f.num,
          new Date(now.getTime() + 3600 * 1000),
          new Date(now.getTime() + 7200 * 1000),
        ]
      );
    }

    console.log("Flights OK.");

    //
    // 4) EXPERIENCES (30 adet)
    //
    const experienceData = [];
    const types = ["food", "adventure", "culture", "romantic", "beach"];

    for (let i = 0; i < 30; i++) {
      const city = cities[i % cities.length].name;
      const type = types[i % types.length];

      experienceData.push({
        title: `${city} ${type} experience ${i + 1}`,
        slug: `exp-${city.toLowerCase()}-${i + 1}`,
        city,
        category: type,
        price: 300 + i * 20,
      });
    }

    for (const e of experienceData) {
      await client.query(
        `INSERT INTO "Experience"
         (title, slug, cityId, category, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [e.title, e.slug, getCityId(e.city), e.category, e.price]
      );
    }

    console.log("Experiences OK.");

    console.log("🎉 SEED COMPLETED SUCCESSFULLY");

  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await client.end();
    console.log("Connection closed.");
  }
}

run();

