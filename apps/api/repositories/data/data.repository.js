/**
 * Data Repository - Database Access Layer
 * Handles all database operations for travel data
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DataRepository {
  /**
   * Get all cities with hotel/experience counts
   */
  async getAllCities() {
    try {
      const cities = await prisma.city.findMany({
        include: {
          hotels: true,
          experiences: true,
        },
      });

      return cities.map((city) => ({
        id: city.id,
        name: city.name,
        countryCode: city.countryCode,
        hotels: city.hotels.length,
        experiences: city.experiences.length,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch cities: ${error.message}`);
    }
  }

  /**
   * Get hotels for a specific city
   */
  async getHotelsByCity(cityId) {
    try {
      return await prisma.hotel.findMany({
        where: { cityId },
      });
    } catch (error) {
      throw new Error(`Failed to fetch hotels: ${error.message}`);
    }
  }

  /**
   * Get experiences for a specific city
   */
  async getExperiencesByCity(cityId) {
    try {
      return await prisma.experience.findMany({
        where: { cityId },
      });
    } catch (error) {
      throw new Error(`Failed to fetch experiences: ${error.message}`);
    }
  }

  /**
   * Get flights between two cities
   */
  async getFlightsBetweenCities(fromId, toId) {
    try {
      return await prisma.flight.findMany({
        where: {
          fromCityId: fromId,
          toCityId: toId,
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch flights: ${error.message}`);
    }
  }

  /**
   * Get all data for AI processing
   */
  async getAllData() {
    try {
      const cities = await prisma.city.findMany();
      const hotels = await prisma.hotel.findMany();
      const flights = await prisma.flight.findMany();
      const experiences = await prisma.experience.findMany();

      return { cities, hotels, flights, experiences };
    } catch (error) {
      throw new Error(`Failed to fetch all data: ${error.message}`);
    }
  }
}

module.exports = new DataRepository();