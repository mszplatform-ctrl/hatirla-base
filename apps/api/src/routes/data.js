const express = require('express');
const router = express.Router();

const dataRepository = require('../../repositories/data/data.repository');

// Data service root
router.get('/', (req, res) => {
  res.json({
    status: 'data service online',
    language: req.lang || 'tr'
  });
});

// Health
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'data',
    timestamp: new Date().toISOString(),
    language: req.lang || 'tr'
  });
});

// GET /api/data/cities
router.get('/cities', async (req, res) => {
  try {
    const cities = await dataRepository.getAllCities();
    res.json(cities);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch cities',
      message: error.message,
    });
  }
});

// GET /api/data/cities/:id/hotels
router.get('/cities/:id/hotels', async (req, res) => {
  try {
    const hotels = await dataRepository.getHotelsByCity(Number(req.params.id));
    res.json(hotels);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch hotels',
      message: error.message,
    });
  }
});

// GET /api/data/cities/:id/experiences
router.get('/cities/:id/experiences', async (req, res) => {
  try {
    const experiences = await dataRepository.getExperiencesByCity(Number(req.params.id));
    res.json(experiences);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch experiences',
      message: error.message,
    });
  }
});

module.exports = router;
