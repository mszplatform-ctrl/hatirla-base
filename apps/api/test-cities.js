const db = require('./db');

const hotelCities = db.prepare(`
  SELECT city, COUNT(*) as hotel_count 
  FROM hotels 
  WHERE city IS NOT NULL AND city != '' 
  GROUP BY city
`).all();

const experienceCities = db.prepare(`
  SELECT city, COUNT(*) as experience_count 
  FROM experiences 
  WHERE city IS NOT NULL AND city != '' 
  GROUP BY city
`).all();

const cityMap = new Map();
hotelCities.forEach(({ city, hotel_count }) => {
  cityMap.set(city, { name: city, hotel_count: hotel_count || 0, experience_count: 0 });
});

experienceCities.forEach(({ city, experience_count }) => {
  if (cityMap.has(city)) {
    cityMap.get(city).experience_count = experience_count || 0;
  } else {
    cityMap.set(city, { name: city, hotel_count: 0, experience_count: experience_count || 0 });
  }
});

const cities = Array.from(cityMap.values()).map(city => ({
  ...city,
  total_count: city.hotel_count + city.experience_count
})).sort((a, b) => b.total_count - a.total_count);

console.log('🌍 Cities endpoint result:');
console.log(JSON.stringify(cities, null, 2));