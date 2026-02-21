// scripts/beta-seed.js
const db = require('../db');

const TAG = '[beta_seed]';

const hasColumn = (table, col) => {
  const cols = db.prepare('PRAGMA table_info(' + table + ')').all().map(c => c.name);
  return cols.includes(col);
};

const safeJson = (v) => (v === undefined ? null : JSON.stringify(v));

const resetIfAsked = () => {
  const argReset = process.argv.includes('--reset');
  if (!argReset) return;
  console.log('🧹 Reset mode: deleting existing beta_seed records...\n');
  if (hasColumn('hotels', 'description')) {
    db.prepare('DELETE FROM hotels WHERE description LIKE ?').run(TAG + '%');
  }
  try {
    if (hasColumn('experiences', 'description')) {
      db.prepare('DELETE FROM experiences WHERE description LIKE ?').run(TAG + '%');
    }
  } catch (_) {}
  console.log('✅ Reset done.\n');
};

const alreadySeeded = () => {
  if (!hasColumn('hotels', 'description')) return false;
  const row = db.prepare('SELECT COUNT(*) AS c FROM hotels WHERE description LIKE ?').get(TAG + '%');
  return (row?.c || 0) > 0;
};

console.log('🌱 Starting BETA seed (schema-compatible, 8 countries)...\n');

resetIfAsked();

if (alreadySeeded()) {
  console.log('⚠️  Beta seed already exists. Skipping...');
  console.log('   To re-seed: node scripts/beta-seed.js --reset\n');
  process.exit(0);
}

db.prepare('BEGIN').run();

try {
  console.log('🏨 Seeding hotels...');
  const hotelStmt = db.prepare('INSERT INTO hotels (name, description, city, country, images, rating, price_per_night, amenities, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

  const hotels = [
    // Istanbul (Turkey) - 5 hotels
    { name: 'Grand Plaza Istanbul', city: 'Istanbul', country: 'Turkey', price_per_night: 1200, rating: 4.5, images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'], amenities: ['wifi', 'breakfast', 'spa'], location: { area: 'Beşiktaş', lat: 41.043, lng: 29.003 }, description: 'Luxury hotel with Bosphorus view' },
    { name: 'Çırağan Palace Kempinski', city: 'Istanbul', country: 'Turkey', price_per_night: 3500, rating: 4.9, images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'bosphorus_view'], location: { area: 'Beşiktaş', lat: 41.048, lng: 29.009 }, description: 'Ottoman palace turned 5-star hotel on the Bosphorus' },
    { name: 'Four Seasons Hotel Istanbul at Sultanahmet', city: 'Istanbul', country: 'Turkey', price_per_night: 2800, rating: 4.8, images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5'], amenities: ['wifi', 'spa', 'breakfast', 'historical'], location: { area: 'Sultanahmet', lat: 41.005, lng: 28.977 }, description: 'Former 19th-century Ottoman prison converted to luxury hotel' },
    { name: 'Raffles Istanbul', city: 'Istanbul', country: 'Turkey', price_per_night: 2200, rating: 4.7, images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d'], amenities: ['wifi', 'pool', 'spa', 'breakfast'], location: { area: 'Zorlu Center', lat: 41.063, lng: 29.015 }, description: 'Contemporary luxury in the heart of Istanbul' },
    { name: 'Soho House Istanbul', city: 'Istanbul', country: 'Turkey', price_per_night: 1600, rating: 4.6, images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461'], amenities: ['wifi', 'rooftop_pool', 'gym', 'bar'], location: { area: 'Beyoğlu', lat: 41.032, lng: 28.983 }, description: 'Members club hotel in a historic 19th-century building' },

    // Paris (France) - 5 hotels
    { name: 'Hotel Le Marais', city: 'Paris', country: 'France', price_per_night: 1800, rating: 4.7, images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34'], amenities: ['wifi', 'city_view'], location: { area: 'Le Marais', lat: 48.857, lng: 2.362 }, description: 'Boutique hotel near Eiffel Tower' },
    { name: 'The Ritz Paris', city: 'Paris', country: 'France', price_per_night: 8000, rating: 5.0, images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'michelin_dining'], location: { area: 'Place Vendôme', lat: 48.868, lng: 2.329 }, description: 'Legendary palace hotel on Place Vendôme since 1898' },
    { name: 'Shangri-La Paris', city: 'Paris', country: 'France', price_per_night: 4500, rating: 4.9, images: ['https://images.unsplash.com/photo-1549294413-26f195200c16'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'eiffel_view'], location: { area: '16th arrondissement', lat: 48.863, lng: 2.298 }, description: 'Eiffel Tower views from a former imperial residence' },
    { name: 'Le Bristol Paris', city: 'Paris', country: 'France', price_per_night: 5500, rating: 4.9, images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'michelin_dining'], location: { area: 'Faubourg Saint-Honoré', lat: 48.873, lng: 2.313 }, description: 'Parisian luxury on the most prestigious shopping street' },
    { name: 'Hotel de Crillon', city: 'Paris', country: 'France', price_per_night: 6000, rating: 4.9, images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'], amenities: ['wifi', 'spa', 'breakfast', 'historic', 'butler_service'], location: { area: 'Place de la Concorde', lat: 48.866, lng: 2.321 }, description: '18th-century palace overlooking Place de la Concorde' },

    // Rome (Italy) - 5 hotels
    { name: 'Roma Palazzo', city: 'Rome', country: 'Italy', price_per_night: 1500, rating: 4.6, images: ['https://images.unsplash.com/photo-1587339078403-e4b09ea78acf'], amenities: ['wifi', 'historic', 'breakfast'], location: { area: 'Centro Storico', lat: 41.902, lng: 12.496 }, description: 'Historic hotel near Colosseum' },
    { name: 'Hotel de Russie', city: 'Rome', country: 'Italy', price_per_night: 4000, rating: 4.9, images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'secret_garden'], location: { area: 'Piazza del Popolo', lat: 41.910, lng: 12.477 }, description: 'Serene sanctuary steps from the Spanish Steps' },
    { name: 'Hassler Roma', city: 'Rome', country: 'Italy', price_per_night: 3500, rating: 4.8, images: ['https://images.unsplash.com/photo-1455587734955-081b22074882'], amenities: ['wifi', 'rooftop_dining', 'spa', 'breakfast'], location: { area: 'Spanish Steps', lat: 41.906, lng: 12.483 }, description: 'Iconic hotel atop the Spanish Steps since 1885' },
    { name: 'Hotel Eden Rome', city: 'Rome', country: 'Italy', price_per_night: 3200, rating: 4.8, images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32'], amenities: ['wifi', 'rooftop_pool', 'spa', 'breakfast', 'panoramic_views'], location: { area: 'Via Ludovisi', lat: 41.909, lng: 12.490 }, description: 'Dorchester Collection hotel with sweeping Roman rooftop views' },
    { name: 'Il Palazzetto', city: 'Rome', country: 'Italy', price_per_night: 1800, rating: 4.7, images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'], amenities: ['wifi', 'breakfast', 'terrace', 'wine_bar'], location: { area: 'Spanish Steps', lat: 41.906, lng: 12.482 }, description: 'Intimate boutique hotel with panoramic terrace above Spanish Steps' },

    // Barcelona (Spain) - 5 hotels
    { name: 'Barcelona Beach Resort', city: 'Barcelona', country: 'Spain', price_per_night: 1400, rating: 4.8, images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'], amenities: ['pool', 'beach', 'wifi'], location: { area: 'Barceloneta', lat: 41.381, lng: 2.189 }, description: 'Beachfront luxury resort' },
    { name: 'Hotel Arts Barcelona', city: 'Barcelona', country: 'Spain', price_per_night: 3000, rating: 4.8, images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'ocean_view'], location: { area: 'Barceloneta', lat: 41.385, lng: 2.197 }, description: 'Skyscraper hotel towering over the Mediterranean beach' },
    { name: 'W Barcelona', city: 'Barcelona', country: 'Spain', price_per_night: 2500, rating: 4.7, images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7'], amenities: ['wifi', 'infinity_pool', 'spa', 'nightclub', 'sea_view'], location: { area: 'Port Olímpic', lat: 41.374, lng: 2.194 }, description: 'Iconic sail-shaped tower on the Barcelona waterfront' },
    { name: 'Mandarin Oriental Barcelona', city: 'Barcelona', country: 'Spain', price_per_night: 3500, rating: 4.9, images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'michelin_dining'], location: { area: 'Passeig de Gràcia', lat: 41.392, lng: 2.165 }, description: 'Elegant luxury on Barcelona\'s most fashionable boulevard' },
    { name: 'El Palace Hotel Barcelona', city: 'Barcelona', country: 'Spain', price_per_night: 2200, rating: 4.8, images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791'], amenities: ['wifi', 'rooftop_pool', 'spa', 'breakfast', 'historic'], location: { area: 'Eixample', lat: 41.387, lng: 2.166 }, description: 'Centenary palace hotel on the iconic Gran Via de les Corts Catalanes' },

    // Berlin (Germany) - 5 hotels
    { name: 'Berlin Design Hotel', city: 'Berlin', country: 'Germany', price_per_night: 1100, rating: 4.4, images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'], amenities: ['wifi', 'design', 'workspace'], location: { area: 'Mitte', lat: 52.520, lng: 13.405 }, description: 'Modern design in Mitte district' },
    { name: 'Hotel Adlon Kempinski Berlin', city: 'Berlin', country: 'Germany', price_per_night: 4000, rating: 4.9, images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'brandenburger_tor_view'], location: { area: 'Brandenburger Tor', lat: 52.516, lng: 13.381 }, description: 'Berlin\'s most iconic grand hotel beside the Brandenburg Gate' },
    { name: 'The Ritz-Carlton Berlin', city: 'Berlin', country: 'Germany', price_per_night: 2800, rating: 4.8, images: ['https://images.unsplash.com/photo-1549294413-26f195200c16'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'lounge'], location: { area: 'Potsdamer Platz', lat: 52.510, lng: 13.376 }, description: 'Art Deco grandeur at the heart of reunified Berlin' },
    { name: 'Soho House Berlin', city: 'Berlin', country: 'Germany', price_per_night: 1500, rating: 4.6, images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'], amenities: ['wifi', 'rooftop_pool', 'gym', 'bar', 'art'], location: { area: 'Mitte', lat: 52.527, lng: 13.411 }, description: 'Creative members club hotel in a 1920s department store' },
    { name: 'Waldorf Astoria Berlin', city: 'Berlin', country: 'Germany', price_per_night: 3200, rating: 4.8, images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'michelin_dining'], location: { area: 'Kurfürstendamm', lat: 52.503, lng: 13.329 }, description: 'Iconic tower hotel on legendary Kurfürstendamm boulevard' },

    // Dubai (UAE) - 5 hotels
    { name: 'Dubai Skyline Suites', city: 'Dubai', country: 'UAE', price_per_night: 3500, rating: 4.9, images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c'], amenities: ['luxury', 'pool', 'wifi'], location: { area: 'Downtown', lat: 25.204, lng: 55.271 }, description: 'Iconic luxury stay' },
    { name: 'Burj Al Arab Jumeirah', city: 'Dubai', country: 'UAE', price_per_night: 12000, rating: 5.0, images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'], amenities: ['wifi', 'private_beach', 'butler', 'helicopter', 'fine_dining'], location: { area: 'Jumeirah', lat: 25.141, lng: 55.185 }, description: 'The world\'s most iconic 7-star hotel standing on its own island' },
    { name: 'Atlantis The Palm', city: 'Dubai', country: 'UAE', price_per_night: 4000, rating: 4.8, images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'], amenities: ['wifi', 'waterpark', 'private_beach', 'aquarium', 'multiple_pools'], location: { area: 'Palm Jumeirah', lat: 25.131, lng: 55.117 }, description: 'Legendary resort at the tip of Palm Jumeirah with waterpark and aquarium' },
    { name: 'One&Only The Palm', city: 'Dubai', country: 'UAE', price_per_night: 5500, rating: 4.9, images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'], amenities: ['wifi', 'private_beach', 'pool', 'spa', 'michelin_dining'], location: { area: 'Palm Jumeirah', lat: 25.116, lng: 55.143 }, description: 'Ultra-exclusive Mediterranean-inspired resort on Palm Jumeirah' },
    { name: 'Four Seasons Resort Dubai at Jumeirah Beach', city: 'Dubai', country: 'UAE', price_per_night: 3800, rating: 4.9, images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7'], amenities: ['wifi', 'private_beach', 'multiple_pools', 'spa', 'breakfast'], location: { area: 'Jumeirah', lat: 25.217, lng: 55.245 }, description: 'Beachside elegance with unobstructed views of the Arabian Gulf' },

    // London (UK) - 5 hotels
    { name: 'London Crown Hotel', city: 'London', country: 'UK', price_per_night: 2000, rating: 4.6, images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'], amenities: ['wifi', 'classic', 'breakfast'], location: { area: 'Westminster', lat: 51.499, lng: -0.125 }, description: 'Classic elegance near Westminster' },
    { name: 'The Savoy London', city: 'London', country: 'UK', price_per_night: 5000, rating: 4.9, images: ['https://images.unsplash.com/photo-1455587734955-081b22074882'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'thames_view', 'afternoon_tea'], location: { area: 'Strand', lat: 51.510, lng: -0.120 }, description: 'London\'s most storied grand hotel on the Strand since 1889' },
    { name: 'Claridge\'s Hotel', city: 'London', country: 'UK', price_per_night: 4500, rating: 4.9, images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791'], amenities: ['wifi', 'spa', 'breakfast', 'afternoon_tea', 'art_deco'], location: { area: 'Mayfair', lat: 51.512, lng: -0.148 }, description: 'Art Deco masterpiece in the heart of Mayfair since 1812' },
    { name: 'The Connaught', city: 'London', country: 'UK', price_per_night: 4800, rating: 5.0, images: ['https://images.unsplash.com/photo-1549294413-26f195200c16'], amenities: ['wifi', 'spa', 'breakfast', 'michelin_dining', 'butler_service'], location: { area: 'Mayfair', lat: 51.511, lng: -0.146 }, description: 'Perennially rated the world\'s best hotel, in the heart of Mayfair' },
    { name: 'The Dorchester', city: 'London', country: 'UK', price_per_night: 4200, rating: 4.9, images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'], amenities: ['wifi', 'spa', 'breakfast', 'michelin_dining', 'park_view'], location: { area: 'Park Lane', lat: 51.507, lng: -0.154 }, description: 'Timeless elegance overlooking Hyde Park since 1931' },

    // Tokyo (Japan) - 5 hotels (NEW CITY)
    { name: 'Aman Tokyo', city: 'Tokyo', country: 'Japan', price_per_night: 6000, rating: 4.9, images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'city_view', 'meditation'], location: { area: 'Otemachi', lat: 35.688, lng: 139.763 }, description: 'Serene urban sanctuary soaring above ancient and modern Tokyo' },
    { name: 'Park Hyatt Tokyo', city: 'Tokyo', country: 'Japan', price_per_night: 4500, rating: 4.8, images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'mount_fuji_view', 'fine_dining'], location: { area: 'Shinjuku', lat: 35.685, lng: 139.690 }, description: 'Soaring above Shinjuku, the inspiration for Lost in Translation' },
    { name: 'The Peninsula Tokyo', city: 'Tokyo', country: 'Japan', price_per_night: 5000, rating: 4.9, images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461'], amenities: ['wifi', 'pool', 'spa', 'breakfast', 'imperial_palace_view', 'afternoon_tea'], location: { area: 'Marunouchi', lat: 35.675, lng: 139.758 }, description: 'Overlooking the Imperial Palace moat in the heart of central Tokyo' },
    { name: 'Mandarin Oriental Tokyo', city: 'Tokyo', country: 'Japan', price_per_night: 4800, rating: 4.9, images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791'], amenities: ['wifi', 'spa', 'breakfast', 'panoramic_views', 'michelin_dining'], location: { area: 'Nihonbashi', lat: 35.685, lng: 139.771 }, description: 'Award-winning luxury tower with spectacular city panoramas' },
    { name: 'Four Seasons Hotel Tokyo at Marunouchi', city: 'Tokyo', country: 'Japan', price_per_night: 3800, rating: 4.8, images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'], amenities: ['wifi', 'spa', 'breakfast', 'bullet_train_access', 'modern_design'], location: { area: 'Marunouchi', lat: 35.679, lng: 139.767 }, description: 'Sleek urban retreat above Tokyo Station in the business district' }
  ];

  hotels.forEach(h => hotelStmt.run(h.name, TAG + ' ' + h.description, h.city, h.country, safeJson(h.images), h.rating, h.price_per_night, safeJson(h.amenities), safeJson(h.location)));
  console.log('   ✅ ' + hotels.length + ' hotels seeded\n');

  console.log('🎭 Seeding experiences...');
  const expCols = db.prepare('PRAGMA table_info(experiences)').all().map(c => c.name);
  const col = {
    title: expCols.includes('title') ? 'title' : (expCols.includes('name') ? 'name' : null),
    description: expCols.includes('description') ? 'description' : null,
    city: expCols.includes('city') ? 'city' : null,
    country: expCols.includes('country') ? 'country' : null,
    images: expCols.includes('images') ? 'images' : null,
    rating: expCols.includes('rating') ? 'rating' : null,
    price: expCols.includes('price') ? 'price' : (expCols.includes('price_per_person') ? 'price_per_person' : null),
    duration: expCols.includes('duration') ? 'duration' : null
  };

  const experiences = [
    // Istanbul (Turkey) - 5 experiences
    { title: 'Bosphorus Sunset Cruise', city: 'Istanbul', country: 'Turkey', price: 250, duration: '2 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1524231757912-21f4fe3a7200'], description: 'Romantic cruise along Bosphorus' },
    { title: 'Grand Bazaar Shopping Tour', city: 'Istanbul', country: 'Turkey', price: 120, duration: '3 hours', rating: 4.6, images: ['https://images.unsplash.com/photo-1524231757912-21f4fe3a7200'], description: 'Navigate 4000 shops with a local guide in the world\'s oldest market' },
    { title: 'Turkish Hammam Experience', city: 'Istanbul', country: 'Turkey', price: 180, duration: '2 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'], description: 'Traditional Ottoman bath ritual in a 16th-century hammam' },
    { title: 'Topkapi Palace & Hagia Sophia Tour', city: 'Istanbul', country: 'Turkey', price: 200, duration: '4 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1560969184-10fe8719e047'], description: 'Explore 600 years of Ottoman imperial history with skip-the-line access' },
    { title: 'Istanbul Street Food Tour', city: 'Istanbul', country: 'Turkey', price: 95, duration: '3 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1583422409516-2895a77efded'], description: 'Taste simit, balik ekmek, and künefe across Eminönü and Karaköy' },

    // Paris (France) - 5 experiences
    { title: 'Eiffel Tower Night Walk', city: 'Paris', country: 'France', price: 180, duration: '3 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1511739001486-6bfe10ce785f'], description: 'Illuminated Paris from above' },
    { title: 'Louvre Museum Private Tour', city: 'Paris', country: 'France', price: 320, duration: '3 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1546410531-bb4caa6b424d'], description: 'After-hours access to the Mona Lisa and Venus de Milo with an art historian' },
    { title: 'French Cooking Class in Montmartre', city: 'Paris', country: 'France', price: 240, duration: '4 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1534939561126-855b8675edd7'], description: 'Learn to make croissants and coq au vin from a classically trained chef' },
    { title: 'Versailles Palace Day Trip', city: 'Paris', country: 'France', price: 160, duration: '6 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1591955506264-3f5a6834570a'], description: 'Wander the Hall of Mirrors and Marie Antoinette\'s private gardens' },
    { title: 'Seine River Dinner Cruise', city: 'Paris', country: 'France', price: 290, duration: '2.5 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34'], description: 'Gourmet French dinner as Notre-Dame and the Eiffel Tower glide past' },

    // Rome (Italy) - 5 experiences
    { title: 'Vatican Museums Tour', city: 'Rome', country: 'Italy', price: 220, duration: '4 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1531572753322-ad063cecc140'], description: 'Sistine Chapel & St Peters' },
    { title: 'Colosseum Underground Tour', city: 'Rome', country: 'Italy', price: 280, duration: '3 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1559564484-4b6c07e7e1b1'], description: 'Walk the arena floor and explore hypogeum tunnels where gladiators prepared' },
    { title: 'Roman Food Market Tour', city: 'Rome', country: 'Italy', price: 130, duration: '3 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1534939561126-855b8675edd7'], description: 'Taste fresh pasta, cured meats, and local wines at Campo de\' Fiori' },
    { title: 'Vespa Tour of Rome', city: 'Rome', country: 'Italy', price: 180, duration: '3 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1583422409516-2895a77efded'], description: 'Zip through cobblestone streets to the Pantheon, Piazza Navona, and Trastevere' },
    { title: 'Sunset at the Trevi Fountain', city: 'Rome', country: 'Italy', price: 90, duration: '2 hours', rating: 4.6, images: ['https://images.unsplash.com/photo-1524231757912-21f4fe3a7200'], description: 'Private evening tour of Rome\'s most iconic fountain with gelato tasting' },

    // Barcelona (Spain) - 5 experiences
    { title: 'Sagrada Familia Experience', city: 'Barcelona', country: 'Spain', price: 150, duration: '2 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1583422409516-2895a77efded'], description: 'Gaudis masterpiece guided tour' },
    { title: 'Park Güell & Gaudí Architecture Walk', city: 'Barcelona', country: 'Spain', price: 120, duration: '3 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1543783207-ec64e4d95325'], description: 'Explore Gaudí\'s mosaic wonderland with panoramic city views' },
    { title: 'Flamenco Show in the Gothic Quarter', city: 'Barcelona', country: 'Spain', price: 95, duration: '1.5 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1560969184-10fe8719e047'], description: 'Intimate tablao performance of authentic flamenco with tapas and wine' },
    { title: 'Tapas & Wine Crawl in El Born', city: 'Barcelona', country: 'Spain', price: 110, duration: '3 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1534939561126-855b8675edd7'], description: 'Bar-hop through Barcelona\'s trendiest neighbourhood with a local foodie guide' },
    { title: 'Camp Nou & FC Barcelona Stadium Tour', city: 'Barcelona', country: 'Spain', price: 80, duration: '2 hours', rating: 4.6, images: ['https://images.unsplash.com/photo-1546410531-bb4caa6b424d'], description: 'Walk the pitch and explore the trophy room of one of football\'s greatest clubs' },

    // Berlin (Germany) - 5 experiences
    { title: 'Berlin Wall History Tour', city: 'Berlin', country: 'Germany', price: 120, duration: '3 hours', rating: 4.5, images: ['https://images.unsplash.com/photo-1560969184-10fe8719e047'], description: 'Cold War history walking tour' },
    { title: 'Reichstag Dome & Government District Tour', city: 'Berlin', country: 'Germany', price: 90, duration: '2.5 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'], description: 'Climb the glass dome of Germany\'s parliament and explore the government quarter' },
    { title: 'WWII Bunker Underground Tour', city: 'Berlin', country: 'Germany', price: 150, duration: '2 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1559564484-4b6c07e7e1b1'], description: 'Explore authentic WWII air raid shelters beneath the city streets' },
    { title: 'Berlin Street Art & Kreuzberg Tour', city: 'Berlin', country: 'Germany', price: 75, duration: '2.5 hours', rating: 4.6, images: ['https://images.unsplash.com/photo-1583422409516-2895a77efded'], description: 'Discover world-class murals and the alternative culture of Kreuzberg with a local artist' },
    { title: 'Museum Island Private Evening Tour', city: 'Berlin', country: 'Germany', price: 200, duration: '3 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1531572753322-ad063cecc140'], description: 'After-hours access to the Pergamon Museum and the bust of Nefertiti' },

    // Dubai (UAE) - 5 experiences
    { title: 'Desert Safari Adventure', city: 'Dubai', country: 'UAE', price: 400, duration: '6 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3'], description: 'Dune bashing and Bedouin dinner' },
    { title: 'Burj Khalifa At the Top Experience', city: 'Dubai', country: 'UAE', price: 200, duration: '2 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c'], description: 'Ascend to the 148th floor observation deck of the world\'s tallest building' },
    { title: 'Dubai Marina Yacht Cruise', city: 'Dubai', country: 'UAE', price: 350, duration: '3 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7'], description: 'Sail past the Palm Jumeirah and Atlantis with sunset cocktails on the Arabian Gulf' },
    { title: 'Gold & Spice Souk Walking Tour', city: 'Dubai', country: 'UAE', price: 80, duration: '2 hours', rating: 4.6, images: ['https://images.unsplash.com/photo-1524231757912-21f4fe3a7200'], description: 'Bargain for saffron, frankincense, and 18-karat gold in historic Deira' },
    { title: 'Seaplane Tour Over the Palm Jumeirah', city: 'Dubai', country: 'UAE', price: 700, duration: '1.5 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'], description: 'Bird\'s-eye views of the Palm, World Islands, and Burj Al Arab from a floatplane' },

    // London (UK) - 5 experiences
    { title: 'Thames River Evening Cruise', city: 'London', country: 'UK', price: 200, duration: '2 hours', rating: 4.6, images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'], description: 'See London landmarks by night' },
    { title: 'Tower of London & Crown Jewels Tour', city: 'London', country: 'UK', price: 180, duration: '3 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1455587734955-081b22074882'], description: 'Explore 1000 years of royal history and see the world\'s most famous diamonds' },
    { title: 'Buckingham Palace & Royal London Walk', city: 'London', country: 'UK', price: 95, duration: '2.5 hours', rating: 4.6, images: ['https://images.unsplash.com/photo-1534939561126-855b8675edd7'], description: 'Follow royal footsteps from Trafalgar Square through St James\'s Park to the Palace' },
    { title: 'Warner Bros. Harry Potter Studio Tour', city: 'London', country: 'UK', price: 320, duration: '5 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1546410531-bb4caa6b424d'], description: 'Walk through original Hogwarts sets and see real costumes and props from the films' },
    { title: 'Jack the Ripper Evening Walking Tour', city: 'London', country: 'UK', price: 60, duration: '2 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1543783207-ec64e4d95325'], description: 'Follow the Victorian murderer\'s trail through gaslit Whitechapel with a crime historian' },

    // Tokyo (Japan) - 5 experiences (NEW CITY)
    { title: 'Tsukiji Outer Market Morning Food Tour', city: 'Tokyo', country: 'Japan', price: 140, duration: '3 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1534939561126-855b8675edd7'], description: 'Taste fresh sashimi, tamagoyaki, and matcha at the world\'s greatest fish market' },
    { title: 'Mount Fuji & Hakone Day Trip', city: 'Tokyo', country: 'Japan', price: 290, duration: '10 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'], description: 'See Japan\'s sacred volcano up close with onsen bathing and Lake Ashi cruise' },
    { title: 'Traditional Tea Ceremony in Yanaka', city: 'Tokyo', country: 'Japan', price: 110, duration: '2 hours', rating: 4.8, images: ['https://images.unsplash.com/photo-1524231757912-21f4fe3a7200'], description: 'Learn the ancient art of chado in a preserved Edo-period machiya townhouse' },
    { title: 'Shibuya & Harajuku Street Food Night Tour', city: 'Tokyo', country: 'Japan', price: 100, duration: '3 hours', rating: 4.7, images: ['https://images.unsplash.com/photo-1583422409516-2895a77efded'], description: 'Graze on ramen, takoyaki, and crepes through neon-lit Tokyo\'s most vibrant districts' },
    { title: 'Sumo Morning Practice & Chankonabe Lunch', city: 'Tokyo', country: 'Japan', price: 220, duration: '4 hours', rating: 4.9, images: ['https://images.unsplash.com/photo-1560969184-10fe8719e047'], description: 'Watch professional sumo wrestlers train at a real stable, then share their traditional stew' }
  ];

  const insertCols = [];
  if (col.title) insertCols.push(col.title);
  if (col.description) insertCols.push(col.description);
  if (col.city) insertCols.push(col.city);
  if (col.country) insertCols.push(col.country);
  if (col.images) insertCols.push(col.images);
  if (col.rating) insertCols.push(col.rating);
  if (col.price) insertCols.push(col.price);
  if (col.duration) insertCols.push(col.duration);

  const placeholders = insertCols.map(() => '?').join(', ');
  const expStmt = db.prepare('INSERT INTO experiences (' + insertCols.join(', ') + ') VALUES (' + placeholders + ')');

  experiences.forEach(e => {
    const values = [];
    if (col.title) values.push(e.title);
    if (col.description) values.push(TAG + ' ' + e.description);
    if (col.city) values.push(e.city);
    if (col.country) values.push(e.country);
    if (col.images) values.push(safeJson(e.images));
    if (col.rating) values.push(e.rating);
    if (col.price) values.push(e.price);
    if (col.duration) values.push(e.duration);
    expStmt.run(...values);
  });

  console.log('   ✅ ' + experiences.length + ' experiences seeded\n');

  db.prepare('COMMIT').run();

  console.log('✅ Beta seed completed!\n');
  console.log('📊 Summary:');
  console.log('   Hotels: ' + hotels.length);
  console.log('   Experiences: ' + experiences.length);
  console.log('   Cities: Istanbul, Paris, Rome, Barcelona, Berlin, Dubai, London, Tokyo');
  console.log('   Countries: 8\n');

} catch (error) {
  db.prepare('ROLLBACK').run();
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
}
