// index.js (Express + Prisma + NeonDB)

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client'); // ✅ DOĞRU IMPORT

const app = express();
app.use(cors());
app.use(express.json());

// Prisma Client
const prisma = new PrismaClient();

// ROOT test endpoint
app.get('/', (req, res) => {
  res.json({ status: 'API running', version: '1.0.0' });
});

/* ===========================================
    /api/data/cities
   =========================================== */
app.get('/api/data/cities', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      include: {
        hotels: true,
        experiences: true,
      },
    });

    const mapped = cities.map((city) => ({
      id: city.id,
      name: city.name,
      countryCode: city.countryCode,
      hotels: city.hotels.length,
      experiences: city.experiences.length,
    }));

    res.json(mapped);
  } catch (err) {
    console.error('CITY_FETCH_ERROR', err);
    res.status(500).json({ error: 'CITY_FETCH_ERROR' });
  }
});

/* ===========================================
    /api/data/hotels?cityId=1
   =========================================== */
app.get('/api/data/hotels', async (req, res) => {
  const cityId = Number(req.query.cityId);
  if (!cityId) return res.status(400).json({ error: 'cityId required' });

  try {
    const hotels = await prisma.hotel.findMany({
      where: { cityId },
    });

    res.json(hotels);
  } catch (err) {
    console.error('HOTEL_FETCH_ERROR', err);
    res.status(500).json({ error: 'HOTEL_FETCH_ERROR' });
  }
});

/* ===========================================
    /api/data/experiences?cityId=1
   =========================================== */
app.get('/api/data/experiences', async (req, res) => {
  const cityId = Number(req.query.cityId);
  if (!cityId) return res.status(400).json({ error: 'cityId required' });

  try {
    const exps = await prisma.experience.findMany({
      where: { cityId },
    });

    res.json(exps);
  } catch (err) {
    console.error('EXPERIENCE_FETCH_ERROR', err);
    res.status(500).json({ error: 'EXPERIENCE_FETCH_ERROR' });
  }
});

/* ===========================================
    /api/data/flights?fromId=X&toId=Y
   =========================================== */
app.get('/api/data/flights', async (req, res) => {
  const fromId = Number(req.query.fromId);
  const toId = Number(req.query.toId);

  if (!fromId || !toId) {
    return res
      .status(400)
      .json({ error: 'fromId and toId required' });
  }

  try {
    const flights = await prisma.flight.findMany({
      where: {
        fromCityId: fromId,
        toCityId: toId,
      },
    });

    res.json(flights);
  } catch (err) {
    console.error('FLIGHT_FETCH_ERROR', err);
    res.status(500).json({ error: 'FLIGHT_FETCH_ERROR' });
  }
});

/* ===========================================
    /api/data/all  (AI için)
   =========================================== */
app.get('/api/data/all', async (req, res) => {
  try {
    const cities = await prisma.city.findMany();
    const hotels = await prisma.hotel.findMany();
    const flights = await prisma.flight.findMany();
    const experiences = await prisma.experience.findMany();

    res.json({ cities, hotels, flights, experiences });
  } catch (err) {
    console.error('ALL_DATA_FETCH_ERROR', err);
    res.status(500).json({ error: 'ALL_DATA_FETCH_ERROR' });
  }
});

/* ===========================================
    AŞAMA 3 — AI MOCK ENDPOINTLERİ
   =========================================== */

// Basit AI öneri mock'u
app.get('/api/ai/suggestions', (req, res) => {
  const suggestions = [
    {
      type: 'hotel',
      score: 0.93,
      payload: {
        id: 'demo-hotel-1',
        name: 'AI Demo Hotel',
        price: 120,
        currency: 'USD',
      },
    },
    {
      type: 'experience',
      score: 0.88,
      payload: {
        id: 'demo-exp-1',
        title: 'AI City Food Tour',
        price: 45,
        currency: 'USD',
      },
    },
    {
      type: 'flight',
      score: 0.81,
      payload: {
        from: 'IST',
        to: 'AMS',
        price: 89,
        currency: 'USD',
      },
    },
  ];

  res.json(suggestions);
});

// Seçilen öğelerden mini paket (itinerary) mock'u
app.post('/api/ai/compose', (req, res) => {
  const body = req.body || {};
  const selections = Array.isArray(body.selections) ? body.selections : [];

  const totalPrice = selections.reduce((sum, item) => {
    const price =
      item.price ||
      item.minPrice ||
      (item.payload && (item.payload.price || item.payload.minPrice)) ||
      0;
    return sum + (typeof price === 'number' ? price : 0);
  }, 0);

  const itinerary = {
    items: selections,
    totalPrice,
    currency:
      selections.find(
        (s) => s.currency || (s.payload && s.payload.currency)
      )?.currency || 'USD',
    summary: `Toplam ${selections.length} öğe ile basit bir seyahat planı.`,
  };

  res.json({ itinerary });
});

// SERVER START
const PORT =
  process.env.PORT ||
  Number(process.env.EXPRESS_PORT) ||
  3001;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

// Render kapanırken Prisma bağlantısını düzgün kapat
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});


