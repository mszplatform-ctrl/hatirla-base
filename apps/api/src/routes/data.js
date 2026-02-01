const express = require('express');
const router = express.Router();
const db = require('../../db'); // Root'taki gerçek DB

// Health endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'data',
    timestamp: new Date().toISOString(),
    language: req.lang || 'tr'
  });
});

// GET /api/data/cities
router.get('/cities', (req, res) => {
  try {
    // Hotels'den şehirleri al
    const hotelCities = db.prepare(`
      SELECT 
        city,
        COUNT(*) as hotel_count
      FROM hotels
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
    `).all();

    // Experiences'den şehirleri al
    const experienceCities = db.prepare(`
      SELECT 
        city,
        COUNT(*) as experience_count
      FROM experiences
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
    `).all();

    // Şehirleri birleştir
    const cityMap = new Map();

    // Hotels'den gelen şehirleri ekle
    hotelCities.forEach(({ city, hotel_count }) => {
      cityMap.set(city, {
        name: city,
        hotel_count: hotel_count || 0,
        experience_count: 0
      });
    });

    // Experiences'den gelen şehirleri ekle/güncelle
    experienceCities.forEach(({ city, experience_count }) => {
      if (cityMap.has(city)) {
        cityMap.get(city).experience_count = experience_count || 0;
      } else {
        cityMap.set(city, {
          name: city,
          hotel_count: 0,
          experience_count: experience_count || 0
        });
      }
    });

    // Array'e çevir ve sırala
    const cities = Array.from(cityMap.values())
      .map(city => ({
        ...city,
        total_count: city.hotel_count + city.experience_count
      }))
      .sort((a, b) => b.total_count - a.total_count);

    res.json({
      success: true,
      data: cities,
      count: cities.length
    });

  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities',
      message: error.message
    });
  }
});

module.exports = router;