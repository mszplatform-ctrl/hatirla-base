/**
 * Data Controller - HTTP Request/Response Handler
 * Handles routing and HTTP layer for data endpoints
 */

const dataService = require('../../services/data/data.service');

class DataController {
  /**
   * GET /api/data/cities
   * Fetch all cities with hotel/experience counts
   */
  async getCities(req, res) {
    try {
      const cities = await dataService.getCities();
      res.json(cities);
    } catch (error) {
      console.error('[Data Controller] Get cities error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'CITY_FETCH_ERROR' 
      });
    }
  }

  /**
   * GET /api/data/hotels?cityId=1
   * Fetch hotels for a specific city
   */
  async getHotels(req, res) {
    try {
      const cityId = Number(req.query.cityId);
      
      if (!cityId) {
        return res.status(400).json({ 
          success: false, 
          error: 'cityId required' 
        });
      }

      const hotels = await dataService.getHotels(cityId);
      res.json(hotels);
    } catch (error) {
      console.error('[Data Controller] Get hotels error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'HOTEL_FETCH_ERROR' 
      });
    }
  }

  /**
   * GET /api/data/experiences?cityId=1
   * Fetch experiences for a specific city
   */
  async getExperiences(req, res) {
    try {
      const cityId = Number(req.query.cityId);
      
      if (!cityId) {
        return res.status(400).json({ 
          success: false, 
          error: 'cityId required' 
        });
      }

      const experiences = await dataService.getExperiences(cityId);
      res.json(experiences);
    } catch (error) {
      console.error('[Data Controller] Get experiences error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'EXPERIENCE_FETCH_ERROR' 
      });
    }
  }

  /**
   * GET /api/data/flights?fromId=1&toId=2
   * Fetch flights between two cities
   */
  async getFlights(req, res) {
    try {
      const fromId = Number(req.query.fromId);
      const toId = Number(req.query.toId);
      
      if (!fromId || !toId) {
        return res.status(400).json({ 
          success: false, 
          error: 'fromId and toId required' 
        });
      }

      const flights = await dataService.getFlights(fromId, toId);
      res.json(flights);
    } catch (error) {
      console.error('[Data Controller] Get flights error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'FLIGHT_FETCH_ERROR' 
      });
    }
  }

  /**
   * GET /api/data/all
   * Fetch all data for AI processing
   */
  async getAll(req, res) {
    try {
      const allData = await dataService.getAll();
      res.json(allData);
    } catch (error) {
      console.error('[Data Controller] Get all error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'ALL_DATA_FETCH_ERROR' 
      });
    }
  }
}

module.exports = new DataController();