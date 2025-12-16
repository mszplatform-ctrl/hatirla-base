/**
 * Data Routes
 * Maps HTTP endpoints to Data controller methods
 */

const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data/data.controller');

/**
 * GET /api/data/cities
 * Fetch all cities with counts
 */
router.get('/cities', (req, res) => dataController.getCities(req, res));

/**
 * GET /api/data/hotels?cityId=1
 * Fetch hotels for a city
 */
router.get('/hotels', (req, res) => dataController.getHotels(req, res));

/**
 * GET /api/data/experiences?cityId=1
 * Fetch experiences for a city
 */
router.get('/experiences', (req, res) => dataController.getExperiences(req, res));

/**
 * GET /api/data/flights?fromId=1&toId=2
 * Fetch flights between cities
 */
router.get('/flights', (req, res) => dataController.getFlights(req, res));

/**
 * GET /api/data/all
 * Fetch all data for AI
 */
router.get('/all', (req, res) => dataController.getAll(req, res));

module.exports = router;