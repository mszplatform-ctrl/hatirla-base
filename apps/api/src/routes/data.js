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
router.get('/cities', async (req, res) => {
  try {
    // Hotels'den şehirleri al
    const { rows: hotelCities } = await db.query(`
      SELECT
        city,
        COUNT(*) as hotel_count
      FROM hotels
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
    `);

    // Experiences'den şehirleri al
    const { rows: experienceCities } = await db.query(`
      SELECT
        city,
        COUNT(*) as experience_count
      FROM experiences
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
    `);

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

// GET /api/data/hotels
router.get('/hotels', async (req, res) => {
  try {
    const { city, country } = req.query;

    let query = `
      SELECT
        id,
        name,
        description,
        description_tr,
        city,
        country,
        images,
        rating,
        price_per_night,
        amenities,
        location
      FROM hotels
      WHERE 1=1
    `;
    const params = [];

    if (city) {
      params.push(city);
      query += ` AND city = $${params.length}`;
    }

    if (country) {
      params.push(country);
      query += ` AND country = $${params.length}`;
    }

    query += ' ORDER BY rating DESC';

    const lang = req.lang || 'tr';
    const { rows } = await db.query(query, params);
    const hotels = rows.map(h => ({
      ...h,
      description: (lang === 'tr' && h.description_tr) ? h.description_tr : h.description,
      description_tr: undefined
    }));

    res.json({
      success: true,
      data: {
        hotels,
        count: hotels.length
      }
    });

  } catch (error) {
    console.error('GET /data/hotels error:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_HOTELS'
    });
  }
});

// GET /api/data/experiences
router.get('/experiences', async (req, res) => {
  try {
    const { city, country } = req.query;

    let query = `
      SELECT
        id,
        title,
        description,
        description_tr,
        city,
        country,
        images,
        category,
        rating,
        price,
        duration_hours,
        location
      FROM experiences
      WHERE 1=1
    `;
    const params = [];

    if (city) {
      params.push(city);
      query += ` AND city = $${params.length}`;
    }

    if (country) {
      params.push(country);
      query += ` AND country = $${params.length}`;
    }

    query += ' ORDER BY rating DESC';

    const lang = req.lang || 'tr';
    const { rows } = await db.query(query, params);
    const experiences = rows.map(e => ({
      ...e,
      description: (lang === 'tr' && e.description_tr) ? e.description_tr : e.description,
      description_tr: undefined
    }));

    res.json({
      success: true,
      data: {
        experiences,
        count: experiences.length
      }
    });

  } catch (error) {
    console.error('GET /data/experiences error:', error);
    res.status(500).json({
      success: false,
      error: 'FAILED_TO_FETCH_EXPERIENCES'
    });
  }
});

module.exports = router;
