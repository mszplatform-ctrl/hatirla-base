/**
 * AI Repository - Database Access Layer
 * Handles all database operations for AI suggestions and packages
 */
const prisma = require('../../db/prisma');

class AIRepository {
  /**
   * Get all suggestions from database
   * NOTE: Suggestions tablosu henüz yok, mock data döndürüyoruz
   */
  async getAllSuggestions() {
    try {
      // TODO: Suggestions tablosu oluşturulunca aktifleştirilecek
      // return await prisma.suggestion.findMany({
      //   orderBy: { id: 'desc' }
      // });

      // Geçici mock data
      return [
        {
          id: 1,
          type: 'hotel',
          payload: { name: 'Hilton Istanbul', price: 120, rating: 4.5 },
          score: 0.95,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          type: 'flight',
          payload: { origin: 'IST', destination: 'AMS', price: 250 },
          score: 0.88,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          type: 'activity',
          payload: { title: 'Canal Tour', price: 45, duration: '2h' },
          score: 0.82,
          createdAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      throw new Error(`Failed to fetch suggestions: ${error.message}`);
    }
  }

  /**
   * Insert suggestions into database
   * NOTE: Suggestions tablosu henüz yok
   */
  async insertSuggestions(suggestions) {
    try {
      // TODO: Suggestions tablosu oluşturulunca aktifleştirilecek
      // const result = await prisma.suggestion.createMany({
      //   data: suggestions.map(s => ({
      //     type: s.type,
      //     payload: s.payload,
      //     score: s.score || 0
      //   }))
      // });
      // return result.count;

      // Geçici - sadece sayı döndür
      return suggestions.length;
    } catch (error) {
      throw new Error(`Failed to insert suggestions: ${error.message}`);
    }
  }

  /**
   * Create a package from selections
   * USES REAL DATABASE (packages table)
   */
  async createPackage(selections, totalPrice, aiComment = null) {
    try {
      const currency = selections[0]?.currency || 'EUR';
      
      const createdPackage = await prisma.package.create({
        data: {
          items: selections,
          totalPrice: totalPrice,
          currency: currency,
          aiComment: aiComment,
          status: 'draft',
          summary: `Travel package with ${selections.length} items`
        }
      });

      return {
        id: createdPackage.id,
        items: createdPackage.items,
        totalPrice: createdPackage.totalPrice,
        currency: createdPackage.currency,
        summary: createdPackage.summary,
        aiComment: createdPackage.aiComment,
        status: createdPackage.status,
        createdAt: createdPackage.createdAt
      };
    } catch (error) {
      throw new Error(`Failed to create package: ${error.message}`);
    }
  }

  /**
   * Get all packages from database
   * Calculates itemsCount from items JSON field
   */
  async getPackages() {
    try {
      const packages = await prisma.package.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          totalPrice: true,
          currency: true,
          createdAt: true,
          items: true
        }
      });

      // Calculate itemsCount at runtime from items array
      return packages.map(pkg => ({
        id: pkg.id,
        totalPrice: pkg.totalPrice,
        currency: pkg.currency,
        createdAt: pkg.createdAt,
        itemsCount: Array.isArray(pkg.items) ? pkg.items.length : 0
      }));
    } catch (error) {
      throw new Error(`Failed to fetch packages: ${error.message}`);
    }
  }
}

module.exports = new AIRepository();