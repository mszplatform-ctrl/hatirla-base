// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CitySeed = {
  name: string;
  countryCode: string;
  currency: string;
};

const CITY_DATA: CitySeed[] = [
  { name: 'Istanbul',   countryCode: 'TR', currency: 'TRY' },
  { name: 'Berlin',     countryCode: 'DE', currency: 'EUR' },
  { name: 'Paris',      countryCode: 'FR', currency: 'EUR' },
  { name: 'London',     countryCode: 'GB', currency: 'GBP' },
  { name: 'New York',   countryCode: 'US', currency: 'USD' },
  { name: 'Tokyo',      countryCode: 'JP', currency: 'JPY' },
  { name: 'Dubai',      countryCode: 'AE', currency: 'AED' },
  { name: 'Rome',       countryCode: 'IT', currency: 'EUR' },
  { name: 'Barcelona',  countryCode: 'ES', currency: 'EUR' },
  { name: 'Amsterdam',  countryCode: 'NL', currency: 'EUR' }
];

const HOTEL_SUFFIXES = ['Hotel', 'Suites', 'Inn', 'Resort', 'Boutique'];
const EXPERIENCE_CATEGORIES = ['food', 'culture', 'adventure', 'nightlife', 'nature'];
const CARRIERS = ['TK', 'LH', 'BA', 'AF', 'DL', 'EK', 'SQ', 'QR'];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

function getCurrencyForCity(city: CitySeed): string {
  return city.currency || 'EUR';
}

async function main() {
  console.log('🌱 Seeding started...');

  // 1) Eski veriyi temizle (ilişki sırasına dikkat)
  await prisma.flight.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.city.deleteMany();
  console.log('🧹 Existing data cleared.');

  // 2) Şehirleri oluştur
  const createdCities = [];
  for (const city of CITY_DATA) {
    const created = await prisma.city.create({
      data: {
        name: city.name,
        countryCode: city.countryCode
      }
    });
    createdCities.push({ ...created, currency: city.currency });
  }
  console.log(`🏙  Created ${createdCities.length} cities.`);

  // 3) Her şehir için oteller ve deneyimler
  for (const city of createdCities) {
    const cityCurrency = getCurrencyForCity({
      name: city.name,
      countryCode: city.countryCode,
      currency: city.currency
    });

    // Oteller
    const hotelCount = randInt(5, 8);
    const hotelsData = [];
    for (let i = 0; i < hotelCount; i++) {
      const suffix = HOTEL_SUFFIXES[i % HOTEL_SUFFIXES.length];
      const name = `${city.name} ${suffix} ${i + 1}`;
      hotelsData.push({
        name,
        slug: slugify(name),
        description: `${city.name} şehrinde konforlu bir konaklama seçeneği.`,
        cityId: city.id,
        address: `${city.name} City Center`,
        latitude: 40 + Math.random() * 10,
        longitude: 20 + Math.random() * 10,
        starRating: randInt(3, 5),
        minPrice: randInt(80, 400),
        currency: cityCurrency,
        source: 'seed',
        externalId: `HOTEL_${city.id}_${i + 1}`
      });
    }
    await prisma.hotel.createMany({ data: hotelsData });
    console.log(`🏨  ${city.name} için ${hotelCount} hotel oluşturuldu.`);

    // Deneyimler
    const experienceCount = randInt(6, 10);
    const experiencesData = [];
    for (let i = 0; i < experienceCount; i++) {
      const category = EXPERIENCE_CATEGORIES[i % EXPERIENCE_CATEGORIES.length];
      const title = `${city.name} ${category} experience ${i + 1}`;
      experiencesData.push({
        title,
        slug: slugify(title),
        description: `${city.name} şehrinde ${category} odaklı bir deneyim.`,
        cityId: city.id,
        category,
        durationMin: randInt(60, 240),
        price: randInt(20, 150),
        currency: cityCurrency,
        rating: Math.round((3 + Math.random() * 2) * 10) / 10,
        reviewCount: randInt(5, 200),
        source: 'seed',
        externalId: `EXP_${city.id}_${i + 1}`
      });
    }
    await prisma.experience.createMany({ data: experiencesData });
    console.log(`🎭  ${city.name} için ${experienceCount} experience oluşturuldu.`);
  }

  // 4) Şehirler arası round-trip flight’lar
  const flightsData = [];
  const baseDate = new Date();

  for (let i = 0; i < createdCities.length; i++) {
    for (let j = i + 1; j < createdCities.length; j++) {
      const fromCity = createdCities[i];
      const toCity = createdCities[j];

      const dayOffset = randInt(1, 30);
      const departure1 = new Date(baseDate);
      departure1.setDate(baseDate.getDate() + dayOffset);
      departure1.setHours(randInt(6, 20), randInt(0, 59), 0, 0);
      const durationHours1 = randInt(2, 6);
      const arrival1 = new Date(departure1.getTime() + durationHours1 * 60 * 60 * 1000);

      const departure2 = new Date(arrival1);
      departure2.setDate(departure2.getDate() + randInt(1, 7));
      const durationHours2 = randInt(2, 6);
      const arrival2 = new Date(departure2.getTime() + durationHours2 * 60 * 60 * 1000);

      const carrier = CARRIERS[randInt(0, CARRIERS.length - 1)];

      const price1 = randInt(100, 800);
      const price2 = randInt(100, 800);

      // Gidiş (fromCity -> toCity)
      flightsData.push({
        fromCityId: fromCity.id,
        toCityId: toCity.id,
        carrierCode: carrier,
        flightNumber: `${carrier}${randInt(100, 999)}`,
        departureTime: departure1,
        arrivalTime: arrival1,
        price: price1,
        currency: getCurrencyForCity({
          name: fromCity.name,
          countryCode: fromCity.countryCode,
          currency: fromCity.currency
        }),
        source: 'seed',
        externalId: `FL_${fromCity.id}_${toCity.id}_1`
      });

      // Dönüş (toCity -> fromCity)
      flightsData.push({
        fromCityId: toCity.id,
        toCityId: fromCity.id,
        carrierCode: carrier,
        flightNumber: `${carrier}${randInt(100, 999)}`,
        departureTime: departure2,
        arrivalTime: arrival2,
        price: price2,
        currency: getCurrencyForCity({
          name: toCity.name,
          countryCode: toCity.countryCode,
          currency: toCity.currency
        }),
        source: 'seed',
        externalId: `FL_${toCity.id}_${fromCity.id}_2`
      });
    }
  }

  if (flightsData.length > 0) {
    await prisma.flight.createMany({ data: flightsData });
  }
  console.log(`✈️  Created ${flightsData.length} flights (round-trip).`);

  console.log('✅ Seed tamamlandı – veritabanı gerçekçi örnek verilerle dolu.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
