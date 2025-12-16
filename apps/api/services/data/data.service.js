/**
 * Data Service - Business Logic Layer
 * Handles data retrieval business logic
 */

const dataRepository = require('../../repositories/data/data.repository');

class DataService {
  /**
   * Get all cities with hotel/experience counts
   */
  async getCities() {
    try {
      return await dataRepository.getAllCities();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get hotels for a specific city
   */
  async getHotels(cityId) {
    try {
      return await dataRepository.getHotelsByCity(cityId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get experiences for a specific city
   */
  async getExperiences(cityId) {
    try {
      return await dataRepository.getExperiencesByCity(cityId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get flights between two cities
   */
  async getFlights(fromId, toId) {
    try {
      return await dataRepository.getFlightsBetweenCities(fromId, toId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all data for AI processing
   */
  async getAll() {
    try {
      return await dataRepository.getAllData();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DataService();