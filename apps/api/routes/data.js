const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// =========================
// GET /api/data/cities
// =========================
router.get("/cities", async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      include: {
        hotels: true,
        experiences: true,
      },
    });

    // Özetleme (frontend böyle istiyor)
    const formatted = cities.map((c) => ({
      id: c.id,
      name: c.name,
      countryCode: c.countryCode,
      hotels: c.hotels.length,
      experiences: c.experiences.length,
    }));

    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================
// GET /api/data/cities/:id
// =========================
router.get("/cities/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        hotels: true,
        experiences: true,
        departures: true,
        arrivals: true,
      },
    });

    if (!city) return res.status(404).json({ error: "City not found" });

    res.json(city);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================
// GET /api/data/cities/:id/hotels
// =========================
router.get("/cities/:id/hotels", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const hotels = await prisma.hotel.findMany({
      where: { cityId: id },
    });

    res.json(hotels);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================
// GET /api/data/cities/:id/experiences
// =========================
router.get("/cities/:id/experiences", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const experiences = await prisma.experience.findMany({
      where: { cityId: id },
    });

    res.json(experiences);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================
// GET /api/data/hotels
// =========================
router.get("/hotels", async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany();
    res.json(hotels);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================
// GET /api/data/experiences
// =========================
router.get("/experiences", async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany();
    res.json(experiences);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================
// GET /api/data/flights
// =========================
router.get("/flights", async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      include: {
        fromCity: true,
        toCity: true,
      },
    });

    res.json(flights);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


