const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "hatirla.sqlite");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

function main() {
  console.log("⏳ Seeding DB...");

  // Drop and recreate DB (idempotent)
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log("🧹 Old DB deleted.");
  }

  const db = new Database(DB_PATH);

  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  console.log("📐 Schema created.");

  // ─── HOTELS ─────────────────────────────────────────────────────────────────
  const insertHotel = db.prepare(`
    INSERT INTO hotels (id, name, description, description_tr, city, country, images, rating, price_per_night, amenities, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const hotels = [
    // Istanbul (Turkey) - 5 hotels
    { name: "Grand Plaza Istanbul", city: "Istanbul", country: "Turkey", price_per_night: 1200, rating: 4.5, images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"], amenities: ["wifi", "breakfast", "spa"], location: { area: "Beşiktaş", lat: 41.043, lng: 29.003 }, description: "Luxury hotel with Bosphorus view", description_tr: "Boğaz manzaralı lüks otel" },
    { name: "Çırağan Palace Kempinski", city: "Istanbul", country: "Turkey", price_per_night: 3500, rating: 4.9, images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"], amenities: ["wifi", "pool", "spa", "breakfast", "bosphorus_view"], location: { area: "Beşiktaş", lat: 41.048, lng: 29.009 }, description: "Ottoman palace turned 5-star hotel on the Bosphorus", description_tr: "Boğaz kıyısında Osmanlı sarayından dönüştürülmüş 5 yıldızlı otel" },
    { name: "Four Seasons Istanbul at Sultanahmet", city: "Istanbul", country: "Turkey", price_per_night: 2800, rating: 4.8, images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5"], amenities: ["wifi", "spa", "breakfast", "historical"], location: { area: "Sultanahmet", lat: 41.005, lng: 28.977 }, description: "Former 19th-century Ottoman prison converted to luxury hotel", description_tr: "19. yüzyıldan kalma Osmanlı hapishanesinden dönüştürülmüş lüks otel" },
    { name: "Raffles Istanbul", city: "Istanbul", country: "Turkey", price_per_night: 2200, rating: 4.7, images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d"], amenities: ["wifi", "pool", "spa", "breakfast"], location: { area: "Zorlu Center", lat: 41.063, lng: 29.015 }, description: "Contemporary luxury in the heart of Istanbul", description_tr: "İstanbul'un kalbinde çağdaş lüks" },
    { name: "Soho House Istanbul", city: "Istanbul", country: "Turkey", price_per_night: 1600, rating: 4.6, images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461"], amenities: ["wifi", "rooftop_pool", "gym", "bar"], location: { area: "Beyoğlu", lat: 41.032, lng: 28.983 }, description: "Members club hotel in a historic 19th-century building", description_tr: "19. yüzyıldan kalma tarihi binada üyeler kulübü oteli" },

    // Paris (France) - 5 hotels
    { name: "Hotel Le Marais", city: "Paris", country: "France", price_per_night: 1800, rating: 4.7, images: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34"], amenities: ["wifi", "city_view"], location: { area: "Le Marais", lat: 48.857, lng: 2.362 }, description: "Boutique hotel in the historic Le Marais district", description_tr: "Tarihi Le Marais semtinde butik otel" },
    { name: "The Ritz Paris", city: "Paris", country: "France", price_per_night: 8000, rating: 5.0, images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"], amenities: ["wifi", "pool", "spa", "breakfast", "michelin_dining"], location: { area: "Place Vendôme", lat: 48.868, lng: 2.329 }, description: "Legendary palace hotel on Place Vendôme since 1898", description_tr: "1898'den bu yana Place Vendôme'daki efsanevi saray oteli" },
    { name: "Shangri-La Paris", city: "Paris", country: "France", price_per_night: 4500, rating: 4.9, images: ["https://images.unsplash.com/photo-1549294413-26f195200c16"], amenities: ["wifi", "pool", "spa", "breakfast", "eiffel_view"], location: { area: "16th arrondissement", lat: 48.863, lng: 2.298 }, description: "Eiffel Tower views from a former imperial residence", description_tr: "Eski bir imparatorluk konutundan Eyfel Kulesi manzarası" },
    { name: "Le Bristol Paris", city: "Paris", country: "France", price_per_night: 5500, rating: 4.9, images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791"], amenities: ["wifi", "pool", "spa", "breakfast", "michelin_dining"], location: { area: "Faubourg Saint-Honoré", lat: 48.873, lng: 2.313 }, description: "Parisian luxury on the most prestigious shopping street", description_tr: "Paris'in en prestijli alışveriş caddesinde Parisian lüksü" },
    { name: "Hotel de Crillon", city: "Paris", country: "France", price_per_night: 6000, rating: 4.9, images: ["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"], amenities: ["wifi", "spa", "breakfast", "historic", "butler_service"], location: { area: "Place de la Concorde", lat: 48.866, lng: 2.321 }, description: "18th-century palace overlooking Place de la Concorde", description_tr: "Place de la Concorde'a bakan 18. yüzyıldan kalma saray" },

    // Rome (Italy) - 5 hotels
    { name: "Roma Palazzo", city: "Rome", country: "Italy", price_per_night: 1500, rating: 4.6, images: ["https://images.unsplash.com/photo-1587339078403-e4b09ea78acf"], amenities: ["wifi", "historic", "breakfast"], location: { area: "Centro Storico", lat: 41.902, lng: 12.496 }, description: "Historic hotel near the Colosseum", description_tr: "Kolezyum yakınında tarihi otel" },
    { name: "Hotel de Russie", city: "Rome", country: "Italy", price_per_night: 4000, rating: 4.9, images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"], amenities: ["wifi", "pool", "spa", "breakfast", "secret_garden"], location: { area: "Piazza del Popolo", lat: 41.910, lng: 12.477 }, description: "Serene sanctuary steps from the Spanish Steps", description_tr: "İspanyol Merdivenleri'ne yakın huzurlu sığınak" },
    { name: "Hassler Roma", city: "Rome", country: "Italy", price_per_night: 3500, rating: 4.8, images: ["https://images.unsplash.com/photo-1455587734955-081b22074882"], amenities: ["wifi", "rooftop_dining", "spa", "breakfast"], location: { area: "Spanish Steps", lat: 41.906, lng: 12.483 }, description: "Iconic hotel atop the Spanish Steps since 1885", description_tr: "1885'ten bu yana İspanyol Merdivenleri'nin tepesindeki ikonik otel" },
    { name: "Hotel Eden Rome", city: "Rome", country: "Italy", price_per_night: 3200, rating: 4.8, images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32"], amenities: ["wifi", "rooftop_pool", "spa", "breakfast", "panoramic_views"], location: { area: "Via Ludovisi", lat: 41.909, lng: 12.490 }, description: "Dorchester Collection hotel with sweeping Roman rooftop views", description_tr: "Dorchester Collection'ın Roma çatısından panoramik manzarasıyla oteli" },
    { name: "Il Palazzetto", city: "Rome", country: "Italy", price_per_night: 1800, rating: 4.7, images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"], amenities: ["wifi", "breakfast", "terrace", "wine_bar"], location: { area: "Spanish Steps", lat: 41.906, lng: 12.482 }, description: "Intimate boutique hotel with panoramic terrace above Spanish Steps", description_tr: "İspanyol Merdivenleri üzerinde panoramik teraslı küçük butik otel" },

    // Barcelona (Spain) - 5 hotels
    { name: "Barcelona Beach Resort", city: "Barcelona", country: "Spain", price_per_night: 1400, rating: 4.8, images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"], amenities: ["pool", "beach", "wifi"], location: { area: "Barceloneta", lat: 41.381, lng: 2.189 }, description: "Beachfront luxury resort on the Mediterranean", description_tr: "Akdeniz kıyısında plaj lüks tatil köyü" },
    { name: "Hotel Arts Barcelona", city: "Barcelona", country: "Spain", price_per_night: 3000, rating: 4.8, images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"], amenities: ["wifi", "pool", "spa", "breakfast", "ocean_view"], location: { area: "Barceloneta", lat: 41.385, lng: 2.197 }, description: "Skyscraper hotel towering over the Mediterranean beach", description_tr: "Akdeniz plajı üzerinde yükselen gökdelen otel" },
    { name: "W Barcelona", city: "Barcelona", country: "Spain", price_per_night: 2500, rating: 4.7, images: ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"], amenities: ["wifi", "infinity_pool", "spa", "nightclub", "sea_view"], location: { area: "Port Olímpic", lat: 41.374, lng: 2.194 }, description: "Iconic sail-shaped tower on the Barcelona waterfront", description_tr: "Barcelona kıyı şeridinde ikonik yelken şeklinde kule" },
    { name: "Mandarin Oriental Barcelona", city: "Barcelona", country: "Spain", price_per_night: 3500, rating: 4.9, images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461"], amenities: ["wifi", "pool", "spa", "breakfast", "michelin_dining"], location: { area: "Passeig de Gràcia", lat: 41.392, lng: 2.165 }, description: "Elegant luxury on Barcelona's most fashionable boulevard", description_tr: "Barcelona'nın en moda bulvarında zarif lüks" },
    { name: "El Palace Hotel Barcelona", city: "Barcelona", country: "Spain", price_per_night: 2200, rating: 4.8, images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791"], amenities: ["wifi", "rooftop_pool", "spa", "breakfast", "historic"], location: { area: "Eixample", lat: 41.387, lng: 2.166 }, description: "Centenary palace hotel on the iconic Gran Via", description_tr: "İkonik Gran Via'da yüzyıllık saray oteli" },

    // Berlin (Germany) - 5 hotels
    { name: "Berlin Design Hotel", city: "Berlin", country: "Germany", price_per_night: 1100, rating: 4.4, images: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"], amenities: ["wifi", "design", "workspace"], location: { area: "Mitte", lat: 52.520, lng: 13.405 }, description: "Modern design in the Mitte district", description_tr: "Mitte semtinde modern tasarım" },
    { name: "Hotel Adlon Kempinski Berlin", city: "Berlin", country: "Germany", price_per_night: 4000, rating: 4.9, images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"], amenities: ["wifi", "pool", "spa", "breakfast", "brandenburger_tor_view"], location: { area: "Brandenburger Tor", lat: 52.516, lng: 13.381 }, description: "Berlin's most iconic grand hotel beside the Brandenburg Gate", description_tr: "Brandenburg Kapısı yanında Berlin'in en ikonik büyük oteli" },
    { name: "The Ritz-Carlton Berlin", city: "Berlin", country: "Germany", price_per_night: 2800, rating: 4.8, images: ["https://images.unsplash.com/photo-1549294413-26f195200c16"], amenities: ["wifi", "pool", "spa", "breakfast", "lounge"], location: { area: "Potsdamer Platz", lat: 52.510, lng: 13.376 }, description: "Art Deco grandeur at the heart of reunified Berlin", description_tr: "Yeniden birleşen Berlin'in kalbinde Art Deco ihtişamı" },
    { name: "Soho House Berlin", city: "Berlin", country: "Germany", price_per_night: 1500, rating: 4.6, images: ["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"], amenities: ["wifi", "rooftop_pool", "gym", "bar", "art"], location: { area: "Mitte", lat: 52.527, lng: 13.411 }, description: "Creative members club hotel in a 1920s department store", description_tr: "1920'lerden kalma bir alışveriş merkezinde yaratıcı üyeler kulübü oteli" },
    { name: "Waldorf Astoria Berlin", city: "Berlin", country: "Germany", price_per_night: 3200, rating: 4.8, images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461"], amenities: ["wifi", "pool", "spa", "breakfast", "michelin_dining"], location: { area: "Kurfürstendamm", lat: 52.503, lng: 13.329 }, description: "Iconic tower hotel on legendary Kurfürstendamm boulevard", description_tr: "Efsanevi Kurfürstendamm bulvarında ikonik kule otel" },

    // Dubai (UAE) - 5 hotels
    { name: "Dubai Skyline Suites", city: "Dubai", country: "UAE", price_per_night: 3500, rating: 4.9, images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c"], amenities: ["luxury", "pool", "wifi"], location: { area: "Downtown", lat: 25.204, lng: 55.271 }, description: "Iconic luxury stay in Downtown Dubai", description_tr: "Dubai Şehir Merkezi'nde ikonik lüks konaklama" },
    { name: "Burj Al Arab Jumeirah", city: "Dubai", country: "UAE", price_per_night: 12000, rating: 5.0, images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"], amenities: ["wifi", "private_beach", "butler", "helicopter", "fine_dining"], location: { area: "Jumeirah", lat: 25.141, lng: 55.185 }, description: "The world's most iconic 7-star hotel standing on its own island", description_tr: "Kendi adasında duran dünyanın en ikonik 7 yıldızlı oteli" },
    { name: "Atlantis The Palm", city: "Dubai", country: "UAE", price_per_night: 4000, rating: 4.8, images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"], amenities: ["wifi", "waterpark", "private_beach", "aquarium", "multiple_pools"], location: { area: "Palm Jumeirah", lat: 25.131, lng: 55.117 }, description: "Legendary resort at the tip of Palm Jumeirah with waterpark and aquarium", description_tr: "Su parkı ve akvaryumuyla Palm Jumeirah'ın ucundaki efsanevi tatil köyü" },
    { name: "One&Only The Palm", city: "Dubai", country: "UAE", price_per_night: 5500, rating: 4.9, images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"], amenities: ["wifi", "private_beach", "pool", "spa", "michelin_dining"], location: { area: "Palm Jumeirah", lat: 25.116, lng: 55.143 }, description: "Ultra-exclusive Mediterranean-inspired resort on Palm Jumeirah", description_tr: "Palm Jumeirah'da ultra özel Akdeniz ilhamlı tatil köyü" },
    { name: "Four Seasons Dubai at Jumeirah Beach", city: "Dubai", country: "UAE", price_per_night: 3800, rating: 4.9, images: ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"], amenities: ["wifi", "private_beach", "multiple_pools", "spa", "breakfast"], location: { area: "Jumeirah", lat: 25.217, lng: 55.245 }, description: "Beachside elegance with unobstructed views of the Arabian Gulf", description_tr: "Arap Körfezi'nin engelsiz manzarasıyla plaj kenarı zarafeti" },

    // London (UK) - 5 hotels
    { name: "London Crown Hotel", city: "London", country: "UK", price_per_night: 2000, rating: 4.6, images: ["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad"], amenities: ["wifi", "classic", "breakfast"], location: { area: "Westminster", lat: 51.499, lng: -0.125 }, description: "Classic elegance near Westminster", description_tr: "Westminster yakınında klasik zarafet" },
    { name: "The Savoy London", city: "London", country: "UK", price_per_night: 5000, rating: 4.9, images: ["https://images.unsplash.com/photo-1455587734955-081b22074882"], amenities: ["wifi", "pool", "spa", "breakfast", "thames_view", "afternoon_tea"], location: { area: "Strand", lat: 51.510, lng: -0.120 }, description: "London's most storied grand hotel on the Strand since 1889", description_tr: "1889'dan bu yana Strand'daki Londra'nın en köklü büyük oteli" },
    { name: "Claridge's Hotel", city: "London", country: "UK", price_per_night: 4500, rating: 4.9, images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791"], amenities: ["wifi", "spa", "breakfast", "afternoon_tea", "art_deco"], location: { area: "Mayfair", lat: 51.512, lng: -0.148 }, description: "Art Deco masterpiece in the heart of Mayfair since 1812", description_tr: "1812'den bu yana Mayfair'in kalbinde Art Deco şaheseri" },
    { name: "The Connaught", city: "London", country: "UK", price_per_night: 4800, rating: 5.0, images: ["https://images.unsplash.com/photo-1549294413-26f195200c16"], amenities: ["wifi", "spa", "breakfast", "michelin_dining", "butler_service"], location: { area: "Mayfair", lat: 51.511, lng: -0.146 }, description: "Perennially rated the world's best hotel, in the heart of Mayfair", description_tr: "Mayfair'in kalbinde, sürekli olarak dünyanın en iyi oteli seçilen otel" },
    { name: "The Dorchester", city: "London", country: "UK", price_per_night: 4200, rating: 4.9, images: ["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"], amenities: ["wifi", "spa", "breakfast", "michelin_dining", "park_view"], location: { area: "Park Lane", lat: 51.507, lng: -0.154 }, description: "Timeless elegance overlooking Hyde Park since 1931", description_tr: "1931'den bu yana Hyde Park'a bakan zamansız zarafet" },

    // Tokyo (Japan) - 5 hotels
    { name: "Aman Tokyo", city: "Tokyo", country: "Japan", price_per_night: 6000, rating: 4.9, images: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"], amenities: ["wifi", "pool", "spa", "breakfast", "city_view", "meditation"], location: { area: "Otemachi", lat: 35.688, lng: 139.763 }, description: "Serene urban sanctuary soaring above ancient and modern Tokyo", description_tr: "Antik ve modern Tokyo'nun üzerinde yükselen huzurlu kentsel sığınak" },
    { name: "Park Hyatt Tokyo", city: "Tokyo", country: "Japan", price_per_night: 4500, rating: 4.8, images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"], amenities: ["wifi", "pool", "spa", "breakfast", "mount_fuji_view", "fine_dining"], location: { area: "Shinjuku", lat: 35.685, lng: 139.690 }, description: "Soaring above Shinjuku, the inspiration for Lost in Translation", description_tr: "Shinjuku üzerinde yükselen, Lost in Translation'a ilham veren otel" },
    { name: "The Peninsula Tokyo", city: "Tokyo", country: "Japan", price_per_night: 5000, rating: 4.9, images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461"], amenities: ["wifi", "pool", "spa", "breakfast", "imperial_palace_view", "afternoon_tea"], location: { area: "Marunouchi", lat: 35.675, lng: 139.758 }, description: "Overlooking the Imperial Palace moat in the heart of central Tokyo", description_tr: "Merkezi Tokyo'nun kalbinde İmparatorluk Sarayı hendekine bakan otel" },
    { name: "Mandarin Oriental Tokyo", city: "Tokyo", country: "Japan", price_per_night: 4800, rating: 4.9, images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791"], amenities: ["wifi", "spa", "breakfast", "panoramic_views", "michelin_dining"], location: { area: "Nihonbashi", lat: 35.685, lng: 139.771 }, description: "Award-winning luxury tower with spectacular city panoramas", description_tr: "Muhteşem şehir panoramasıyla ödüllü lüks kule" },
    { name: "Four Seasons Tokyo at Marunouchi", city: "Tokyo", country: "Japan", price_per_night: 3800, rating: 4.8, images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"], amenities: ["wifi", "spa", "breakfast", "bullet_train_access", "modern_design"], location: { area: "Marunouchi", lat: 35.679, lng: 139.767 }, description: "Sleek urban retreat above Tokyo Station in the business district", description_tr: "İş merkezinde Tokyo İstasyonu üzerinde şık kentsel sığınak" },
  ];

  // ─── EXPERIENCES ────────────────────────────────────────────────────────────
  const insertExperience = db.prepare(`
    INSERT INTO experiences (id, title, description, description_tr, city, country, images, category, price, rating, duration_hours, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const experiences = [
    // Istanbul (Turkey) - 5 experiences
    { title: "Bosphorus Sunset Cruise", city: "Istanbul", country: "Turkey", price: 250, rating: 4.7, duration_hours: 2, category: "boat", images: ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200"], description: "Romantic cruise along the Bosphorus at sunset", description_tr: "Günbatımında Boğaz'da romantik gezi" },
    { title: "Grand Bazaar Shopping Tour", city: "Istanbul", country: "Turkey", price: 120, rating: 4.6, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200"], description: "Navigate 4000 shops with a local guide in the world's oldest market", description_tr: "Dünyanın en eski pazarında yerel rehberle 4000 dükkanı gezin" },
    { title: "Turkish Hammam Experience", city: "Istanbul", country: "Turkey", price: 180, rating: 4.8, duration_hours: 2, category: "wellness", images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"], description: "Traditional Ottoman bath ritual in a 16th-century hammam", description_tr: "16. yüzyıldan kalma bir hamamda geleneksel Osmanlı banyo ritüeli" },
    { title: "Topkapi Palace & Hagia Sophia Tour", city: "Istanbul", country: "Turkey", price: 200, rating: 4.9, duration_hours: 4, category: "culture", images: ["https://images.unsplash.com/photo-1560969184-10fe8719e047"], description: "Explore 600 years of Ottoman imperial history with skip-the-line access", description_tr: "Öncelikli giriş ile 600 yıllık Osmanlı imparatorluk tarihini keşfedin" },
    { title: "Istanbul Street Food Tour", city: "Istanbul", country: "Turkey", price: 95, rating: 4.7, duration_hours: 3, category: "food", images: ["https://images.unsplash.com/photo-1583422409516-2895a77efded"], description: "Taste simit, balik ekmek, and künefe across Eminönü and Karaköy", description_tr: "Eminönü ve Karaköy'de simit, balık ekmek ve künefe tadın" },

    // Paris (France) - 5 experiences
    { title: "Eiffel Tower Night Walk", city: "Paris", country: "France", price: 180, rating: 4.8, duration_hours: 3, category: "romantic", images: ["https://images.unsplash.com/photo-1511739001486-6bfe10ce785f"], description: "Illuminated Paris from the Eiffel Tower at night", description_tr: "Gece Eyfel Kulesi'nden aydınlanmış Paris manzarası" },
    { title: "Louvre Museum Private Tour", city: "Paris", country: "France", price: 320, rating: 4.9, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1546410531-bb4caa6b424d"], description: "After-hours access to the Mona Lisa and Venus de Milo with an art historian", description_tr: "Bir sanat tarihçisiyle Mona Lisa ve Venüs de Milo'ya gece saatlerinde özel erişim" },
    { title: "French Cooking Class in Montmartre", city: "Paris", country: "France", price: 240, rating: 4.8, duration_hours: 4, category: "food", images: ["https://images.unsplash.com/photo-1534939561126-855b8675edd7"], description: "Learn to make croissants and coq au vin from a classically trained chef", description_tr: "Klasik eğitimli bir şeften kruvasan ve coq au vin yapmayı öğrenin" },
    { title: "Versailles Palace Day Trip", city: "Paris", country: "France", price: 160, rating: 4.7, duration_hours: 6, category: "culture", images: ["https://images.unsplash.com/photo-1591955506264-3f5a6834570a"], description: "Wander the Hall of Mirrors and Marie Antoinette's private gardens", description_tr: "Aynalar Galerisi ve Marie Antoinette'in özel bahçelerinde gezin" },
    { title: "Seine River Dinner Cruise", city: "Paris", country: "France", price: 290, rating: 4.8, duration_hours: 3, category: "romantic", images: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34"], description: "Gourmet French dinner as Notre-Dame and the Eiffel Tower glide past", description_tr: "Notre-Dame ve Eyfel Kulesi geçerken gurme Fransız akşam yemeği" },

    // Rome (Italy) - 5 experiences
    { title: "Vatican Museums Tour", city: "Rome", country: "Italy", price: 220, rating: 4.9, duration_hours: 4, category: "culture", images: ["https://images.unsplash.com/photo-1531572753322-ad063cecc140"], description: "Sistine Chapel & St Peters with skip-the-line access", description_tr: "Öncelikli giriş ile Sistine Şapeli ve Aziz Petrus" },
    { title: "Colosseum Underground Tour", city: "Rome", country: "Italy", price: 280, rating: 4.9, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1559564484-4b6c07e7e1b1"], description: "Walk the arena floor and explore hypogeum tunnels where gladiators prepared", description_tr: "Arena zemininde yürüyün ve gladyatörlerin hazırlandığı hypogeum tünellerini keşfedin" },
    { title: "Roman Food Market Tour", city: "Rome", country: "Italy", price: 130, rating: 4.7, duration_hours: 3, category: "food", images: ["https://images.unsplash.com/photo-1534939561126-855b8675edd7"], description: "Taste fresh pasta, cured meats, and local wines at Campo de' Fiori", description_tr: "Campo de' Fiori'de taze makarna, kürlenmiş et ve yerel şarap tadın" },
    { title: "Vespa Tour of Rome", city: "Rome", country: "Italy", price: 180, rating: 4.8, duration_hours: 3, category: "adventure", images: ["https://images.unsplash.com/photo-1583422409516-2895a77efded"], description: "Zip through cobblestone streets to the Pantheon, Piazza Navona, and Trastevere", description_tr: "Pantheon, Piazza Navona ve Trastevere'ye arnavut kaldırımlı sokaklarda süzülün" },
    { title: "Sunset at the Trevi Fountain", city: "Rome", country: "Italy", price: 90, rating: 4.6, duration_hours: 2, category: "romantic", images: ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200"], description: "Private evening tour of Rome's most iconic fountain with gelato tasting", description_tr: "Dondurma tadımıyla Roma'nın en ikonik çeşmesinin özel akşam turu" },

    // Barcelona (Spain) - 5 experiences
    { title: "Sagrada Familia Experience", city: "Barcelona", country: "Spain", price: 150, rating: 4.8, duration_hours: 2, category: "culture", images: ["https://images.unsplash.com/photo-1583422409516-2895a77efded"], description: "Gaudí's masterpiece guided tour with tower access", description_tr: "Kule erişimiyle Gaudí'nin başyapıtı rehberli tur" },
    { title: "Park Güell & Gaudí Architecture Walk", city: "Barcelona", country: "Spain", price: 120, rating: 4.7, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1543783207-ec64e4d95325"], description: "Explore Gaudí's mosaic wonderland with panoramic city views", description_tr: "Panoramik şehir manzarasıyla Gaudí'nin mozaik harikasını keşfedin" },
    { title: "Flamenco Show in the Gothic Quarter", city: "Barcelona", country: "Spain", price: 95, rating: 4.7, duration_hours: 2, category: "culture", images: ["https://images.unsplash.com/photo-1560969184-10fe8719e047"], description: "Intimate tablao performance of authentic flamenco with tapas and wine", description_tr: "Tapas ve şarapla gotik semtte otantik flamenco gösterisi" },
    { title: "Tapas & Wine Crawl in El Born", city: "Barcelona", country: "Spain", price: 110, rating: 4.8, duration_hours: 3, category: "food", images: ["https://images.unsplash.com/photo-1534939561126-855b8675edd7"], description: "Bar-hop through Barcelona's trendiest neighbourhood with a local foodie guide", description_tr: "Yerel bir gurme rehberle Barcelona'nın en trend semtinde bar turu" },
    { title: "Camp Nou & FC Barcelona Stadium Tour", city: "Barcelona", country: "Spain", price: 80, rating: 4.6, duration_hours: 2, category: "sport", images: ["https://images.unsplash.com/photo-1546410531-bb4caa6b424d"], description: "Walk the pitch and explore the trophy room of one of football's greatest clubs", description_tr: "Futbolun en büyük kulüplerinden birinin sahasında yürüyün ve kupa odasını keşfedin" },

    // Berlin (Germany) - 5 experiences
    { title: "Berlin Wall History Tour", city: "Berlin", country: "Germany", price: 120, rating: 4.5, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1560969184-10fe8719e047"], description: "Cold War history walking tour along the former Wall", description_tr: "Eski Duvar boyunca Soğuk Savaş tarihi yürüyüş turu" },
    { title: "Reichstag Dome & Government District Tour", city: "Berlin", country: "Germany", price: 90, rating: 4.7, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"], description: "Climb the glass dome of Germany's parliament and explore the government quarter", description_tr: "Almanya'nın parlamentosunun cam kubbesini tırmanın ve hükümet çeyreğini keşfedin" },
    { title: "WWII Bunker Underground Tour", city: "Berlin", country: "Germany", price: 150, rating: 4.8, duration_hours: 2, category: "culture", images: ["https://images.unsplash.com/photo-1559564484-4b6c07e7e1b1"], description: "Explore authentic WWII air raid shelters beneath the city streets", description_tr: "Şehrin altındaki otantik II. Dünya Savaşı hava sığınaklarını keşfedin" },
    { title: "Berlin Street Art & Kreuzberg Tour", city: "Berlin", country: "Germany", price: 75, rating: 4.6, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1583422409516-2895a77efded"], description: "Discover world-class murals and the alternative culture of Kreuzberg with a local artist", description_tr: "Yerel bir sanatçıyla Kreuzberg'in alternatif kültürünü ve dünya çapındaki muralleri keşfedin" },
    { title: "Museum Island Private Evening Tour", city: "Berlin", country: "Germany", price: 200, rating: 4.9, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1531572753322-ad063cecc140"], description: "After-hours access to the Pergamon Museum and the bust of Nefertiti", description_tr: "Pergamon Müzesi ve Nefertiti büstüne gece saatlerinde özel erişim" },

    // Dubai (UAE) - 5 experiences
    { title: "Desert Safari Adventure", city: "Dubai", country: "UAE", price: 400, rating: 4.9, duration_hours: 6, category: "adventure", images: ["https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3"], description: "Dune bashing and Bedouin dinner under the stars", description_tr: "Dune bashing ve yıldızlar altında Bedevi akşam yemeği" },
    { title: "Burj Khalifa At the Top Experience", city: "Dubai", country: "UAE", price: 200, rating: 4.8, duration_hours: 2, category: "culture", images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c"], description: "Ascend to the 148th floor observation deck of the world's tallest building", description_tr: "Dünyanın en yüksek binasının 148. kat gözlem platformuna çıkın" },
    { title: "Dubai Marina Yacht Cruise", city: "Dubai", country: "UAE", price: 350, rating: 4.7, duration_hours: 3, category: "boat", images: ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"], description: "Sail past the Palm Jumeirah and Atlantis with sunset cocktails on the Arabian Gulf", description_tr: "Palm Jumeirah ve Atlantis'i geçerek Arap Körfezi'nde günbatımı kokteylleri" },
    { title: "Gold & Spice Souk Walking Tour", city: "Dubai", country: "UAE", price: 80, rating: 4.6, duration_hours: 2, category: "culture", images: ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200"], description: "Bargain for saffron, frankincense, and 18-karat gold in historic Deira", description_tr: "Tarihi Deira'da safran, günlük ve 18 ayar altın için pazarlık yapın" },
    { title: "Seaplane Tour Over the Palm Jumeirah", city: "Dubai", country: "UAE", price: 700, rating: 4.9, duration_hours: 2, category: "adventure", images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"], description: "Bird's-eye views of the Palm, World Islands, and Burj Al Arab from a floatplane", description_tr: "Deniz uçağından Palm, World Islands ve Burj Al Arab'ın kuş bakışı görünümü" },

    // London (UK) - 5 experiences
    { title: "Thames River Evening Cruise", city: "London", country: "UK", price: 200, rating: 4.6, duration_hours: 2, category: "boat", images: ["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad"], description: "See London landmarks by night from the Thames", description_tr: "Thames'ten gece Londra simgelerini görün" },
    { title: "Tower of London & Crown Jewels Tour", city: "London", country: "UK", price: 180, rating: 4.8, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1455587734955-081b22074882"], description: "Explore 1000 years of royal history and see the world's most famous diamonds", description_tr: "1000 yıllık kraliyet tarihini keşfedin ve dünyanın en ünlü elmaslarını görün" },
    { title: "Buckingham Palace & Royal London Walk", city: "London", country: "UK", price: 95, rating: 4.6, duration_hours: 3, category: "culture", images: ["https://images.unsplash.com/photo-1534939561126-855b8675edd7"], description: "Follow royal footsteps from Trafalgar Square through St James's Park to the Palace", description_tr: "Trafalgar Meydanı'ndan St James's Parkı üzerinden Saray'a kadar kraliyet izlerini takip edin" },
    { title: "Warner Bros. Harry Potter Studio Tour", city: "London", country: "UK", price: 320, rating: 4.9, duration_hours: 5, category: "culture", images: ["https://images.unsplash.com/photo-1546410531-bb4caa6b424d"], description: "Walk through original Hogwarts sets and see real costumes and props from the films", description_tr: "Orijinal Hogwarts setlerinden geçin ve filmlerdeki gerçek kostüm ve aksesuarları görün" },
    { title: "Jack the Ripper Evening Walking Tour", city: "London", country: "UK", price: 60, rating: 4.7, duration_hours: 2, category: "culture", images: ["https://images.unsplash.com/photo-1543783207-ec64e4d95325"], description: "Follow the Victorian murderer's trail through gaslit Whitechapel with a crime historian", description_tr: "Bir suç tarihçisiyle gaz lambası Whitechapel'de Viktorya devri katilinin izini takip edin" },

    // Tokyo (Japan) - 5 experiences
    { title: "Tsukiji Outer Market Morning Food Tour", city: "Tokyo", country: "Japan", price: 140, rating: 4.8, duration_hours: 3, category: "food", images: ["https://images.unsplash.com/photo-1534939561126-855b8675edd7"], description: "Taste fresh sashimi, tamagoyaki, and matcha at the world's greatest fish market", description_tr: "Dünyanın en büyük balık pazarında taze sashimi, tamagoyaki ve matcha tadın" },
    { title: "Mount Fuji & Hakone Day Trip", city: "Tokyo", country: "Japan", price: 290, rating: 4.9, duration_hours: 10, category: "adventure", images: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"], description: "See Japan's sacred volcano up close with onsen bathing and Lake Ashi cruise", description_tr: "Japonya'nın kutsal yanardağına yakından bakın, onsen banyosu ve Ashi Gölü gezisi" },
    { title: "Traditional Tea Ceremony in Yanaka", city: "Tokyo", country: "Japan", price: 110, rating: 4.8, duration_hours: 2, category: "culture", images: ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200"], description: "Learn the ancient art of chado in a preserved Edo-period machiya townhouse", description_tr: "Korunan Edo dönemi machiya konağında chado'nun kadim sanatını öğrenin" },
    { title: "Shibuya & Harajuku Street Food Night Tour", city: "Tokyo", country: "Japan", price: 100, rating: 4.7, duration_hours: 3, category: "food", images: ["https://images.unsplash.com/photo-1583422409516-2895a77efded"], description: "Graze on ramen, takoyaki, and crepes through neon-lit Tokyo's most vibrant districts", description_tr: "Tokyo'nun en canlı semtlerinde ramen, takoyaki ve krep yiyerek gece turu" },
    { title: "Sumo Morning Practice & Chankonabe Lunch", city: "Tokyo", country: "Japan", price: 220, rating: 4.9, duration_hours: 4, category: "culture", images: ["https://images.unsplash.com/photo-1560969184-10fe8719e047"], description: "Watch professional sumo wrestlers train at a real stable, then share their traditional stew", description_tr: "Gerçek bir ahırda profesyonel sumo güreşçilerinin antrenmanını izleyin, ardından geleneksel çorbalarını paylaşın" },
  ];

  // ─── INSERT ALL DATA IN A TRANSACTION ───────────────────────────────────────
  db.transaction(() => {
    for (const h of hotels) {
      insertHotel.run(
        randomUUID(),
        h.name,
        h.description,
        h.description_tr,
        h.city,
        h.country,
        JSON.stringify(h.images),
        h.rating,
        h.price_per_night,
        JSON.stringify(h.amenities),
        JSON.stringify(h.location)
      );
    }

    for (const e of experiences) {
      insertExperience.run(
        randomUUID(),
        e.title,
        e.description,
        e.description_tr,
        e.city,
        e.country,
        JSON.stringify(e.images),
        e.category,
        e.price,
        e.rating,
        e.duration_hours,
        null
      );
    }
  })();

  db.close();

  const cities = [...new Set(hotels.map((h) => h.city))];
  console.log(`\n✅ Seed completed!`);
  console.log(`   Hotels:      ${hotels.length} (${hotels.length / cities.length} per city)`);
  console.log(`   Experiences: ${experiences.length} (${experiences.length / cities.length} per city)`);
  console.log(`   Cities (${cities.length}): ${cities.join(", ")}`);
}

main();
