import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import { slugify } from "../utils/slugify.js";

import { User } from "../models/User.js";
import { City } from "../models/City.js";
import { Neighborhood } from "../models/Neighborhood.js";
import { Place } from "../models/Place.js";
import { Food } from "../models/Food.js";
import { Culture } from "../models/Culture.js";
import { Event } from "../models/Event.js";
import { Post } from "../models/Post.js";
import { Comment } from "../models/Comment.js";
import { Review } from "../models/Review.js";
import { Like } from "../models/Like.js";
import { Follow } from "../models/Follow.js";
import { Collection } from "../models/Collection.js";
import { UserActivity } from "../models/UserActivity.js";
import { Notification } from "../models/Notification.js";
import { LanguageLesson } from "../models/LanguageLesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { Achievement } from "../models/Achievement.js";

function img(seed, w = 1200, h = 800) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function daysFromNow(days, hour = 19) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function run() {
  await connectDatabase();
  console.log("[seed] connected — clearing collections");

  await Promise.all([
    User.deleteMany({}),
    City.deleteMany({}),
    Neighborhood.deleteMany({}),
    Place.deleteMany({}),
    Food.deleteMany({}),
    Culture.deleteMany({}),
    Event.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Review.deleteMany({}),
    Like.deleteMany({}),
    Follow.deleteMany({}),
    Collection.deleteMany({}),
    UserActivity.deleteMany({}),
    Notification.deleteMany({}),
    LanguageLesson.deleteMany({}),
    LessonProgress.deleteMany({}),
    Achievement.deleteMany({}),
  ]);

  // ---------------------------------------------------------------- CITIES
  const cityDefs = [
    {
      name: "Seoul",
      tagline: "The capital that never sleeps",
      description:
        "South Korea's sprawling capital — a collision of Joseon-era palaces, glass megatowers, underground clubs, and the fastest-moving street style on the planet.",
      region: "Capital Area",
      population: 9776000,
      center: { lat: 37.5665, lng: 126.978 },
      zoom: 12,
      highlights: ["Gyeongbokgung Palace", "Han River nightlife", "24-hour markets", "K-pop entertainment HQs"],
      transportation: ["Seoul Subway (9 lines)", "T-money card", "Late-night buses", "Kakao Taxi"],
      bestSeason: "Spring (Apr–May) and Autumn (Sep–Oct)",
    },
    {
      name: "Busan",
      tagline: "Coastal energy, port-city grit",
      description:
        "Korea's second city — beaches, mountain temples, the country's biggest fish market, and a film festival that puts it on the world stage every October.",
      region: "Yeongnam",
      population: 3350000,
      center: { lat: 35.1796, lng: 129.0756 },
      zoom: 12,
      highlights: ["Haeundae Beach", "Gamcheon Culture Village", "Jagalchi Fish Market", "Busan International Film Festival"],
      transportation: ["Busan Metro", "Coastal buses", "KTX to Seoul in 2.5h"],
      bestSeason: "Summer (Jun–Aug) for beaches, Autumn for hiking",
    },
    {
      name: "Incheon",
      tagline: "Gateway city, hidden edges",
      description: "Home to Korea's main international airport, a historic Chinatown, and Songdo's built-from-scratch futurism.",
      region: "Capital Area",
      population: 2950000,
      center: { lat: 37.4563, lng: 126.7052 },
      zoom: 12,
      highlights: ["Incheon Chinatown", "Songdo Central Park", "Wolmido Island"],
      transportation: ["AREX airport rail", "Incheon Subway"],
      bestSeason: "Spring and Autumn",
    },
    {
      name: "Daegu",
      tagline: "Fashion, textiles, and fried chicken",
      description: "A historic textile capital reinventing itself as a design and food-culture city in Korea's southeast.",
      region: "Yeongnam",
      population: 2410000,
      center: { lat: 35.8714, lng: 128.6014 },
      zoom: 12,
      highlights: ["Seomun Market", "Kim Kwang-seok Street", "Apsan Park cable car"],
      transportation: ["Daegu Metro", "KTX"],
      bestSeason: "Spring and Autumn",
    },
    {
      name: "Daejeon",
      tagline: "Korea's science capital",
      description: "Research institutes, riverside parks, and a laid-back food scene built around noodle soups.",
      region: "Chungcheong",
      population: 1450000,
      center: { lat: 36.3504, lng: 127.3845 },
      zoom: 12,
      highlights: ["Expo Science Park", "Yuseong hot springs", "Sungsimdang bakery"],
      transportation: ["Daejeon Metro", "KTX"],
      bestSeason: "Spring and Autumn",
    },
    {
      name: "Gwangju",
      tagline: "Art, activism, and soul food",
      description: "A city defined by its democratic history and an art biennale that draws creators from across Asia.",
      region: "Honam",
      population: 1440000,
      center: { lat: 35.1595, lng: 126.8526 },
      zoom: 12,
      highlights: ["Gwangju Biennale", "Asia Culture Center", "5·18 Democracy Square"],
      transportation: ["Gwangju Metro", "KTX"],
      bestSeason: "Autumn (Biennale season)",
    },
    {
      name: "Jeju",
      tagline: "Volcanic island, slower pace",
      description: "Black lava coastlines, haenyeo divers, citrus orchards, and Korea's most photographed sunrise.",
      region: "Jeju Special Self-Governing Province",
      population: 675000,
      center: { lat: 33.4996, lng: 126.5312 },
      zoom: 11,
      highlights: ["Seongsan Ilchulbong", "Hallasan National Park", "Haenyeo diving villages"],
      transportation: ["Rental car recommended", "Island buses"],
      bestSeason: "Spring (canola flowers) and Autumn",
    },
  ];

  const cities = await City.insertMany(
    cityDefs.map((c) => ({ ...c, slug: slugify(c.name) })),
  );
  const cityBySlug = Object.fromEntries(cities.map((c) => [c.slug, c]));
  console.log(`[seed] cities: ${cities.length}`);

  // --------------------------------------------------------- NEIGHBORHOODS
  const neighborhoodDefs = [
    {
      name: "Hongdae",
      citySlug: "seoul",
      tagline: "Indie music, street art, all-night energy",
      description:
        "Built around Hongik University's art scene, Hongdae is Seoul's densest strip of live clubs, street performers, and vintage shops that only really wake up after dark.",
      center: { lat: 37.5563, lng: 126.9236 },
      vibeTags: ["nightlife", "art", "shopping", "kpop"],
      atmosphere: "Loud, young, unpolished, endlessly creative",
      avgPriceLevel: 2,
      bestTimeToVisit: "Friday and Saturday nights, or weekend afternoons for the street market",
      popularActivities: ["Busking street tours", "Indie club hopping", "Vintage clothing hunting", "Free hongdae park performances"],
      rating: 4.6,
      reviewCount: 8,
      featured: true,
    },
    {
      name: "Gangnam",
      citySlug: "seoul",
      tagline: "Glass towers, K-beauty clinics, luxury everything",
      description:
        "The neighborhood that gave the world its most famous K-pop export — now a dense grid of flagship stores, rooftop bars, and the country's plastic-surgery corridor.",
      center: { lat: 37.4979, lng: 127.0276 },
      vibeTags: ["shopping", "nightlife", "wellness", "culture"],
      atmosphere: "Polished, status-driven, high-energy after 9pm",
      avgPriceLevel: 4,
      bestTimeToVisit: "Weekday evenings for a quieter luxury shopping experience",
      popularActivities: ["COEX Starfield Library", "K-beauty clinic tours", "Rooftop bar hopping", "Garosu-gil boutique walk"],
      rating: 4.5,
      reviewCount: 11,
      featured: true,
    },
    {
      name: "Itaewon",
      citySlug: "seoul",
      tagline: "Seoul's most international district",
      description:
        "A hillside neighborhood built around US military history, now home to Seoul's most diverse restaurant scene, LGBTQ nightlife, and the trendy Gyeongnidan-gil strip.",
      center: { lat: 37.5346, lng: 126.9946 },
      vibeTags: ["nightlife", "shopping", "culture"],
      atmosphere: "Cosmopolitan, eclectic, unapologetically mixed",
      avgPriceLevel: 3,
      bestTimeToVisit: "Weekend brunch or Thursday–Saturday nightlife",
      popularActivities: ["World cuisine crawl", "Gyeongnidan-gil café hopping", "Itaewon Global Village Festival"],
      rating: 4.3,
      reviewCount: 9,
    },
    {
      name: "Seongsu",
      citySlug: "seoul",
      tagline: "Seoul's Brooklyn — factories turned cafés",
      description:
        "Former shoe-factory district turned design capital, packed with converted-warehouse cafés, flagship concept stores, and the city's best industrial-chic photo backdrops.",
      center: { lat: 37.5446, lng: 127.0559 },
      vibeTags: ["cafe", "art", "shopping"],
      atmosphere: "Industrial-chic, design-forward, quietly expensive",
      avgPriceLevel: 3,
      bestTimeToVisit: "Weekday mornings before the café queues build",
      popularActivities: ["Warehouse café tours", "Seoul Forest picnics", "Concept store hopping"],
      rating: 4.7,
      reviewCount: 14,
      featured: true,
    },
    {
      name: "Myeongdong",
      citySlug: "seoul",
      tagline: "Cosmetics, street food, and shopping chaos",
      description:
        "Seoul's most tourist-dense shopping strip — wall-to-wall skincare shops, street-food carts, and a nightly frenzy of neon signage.",
      center: { lat: 37.5636, lng: 126.9834 },
      vibeTags: ["shopping", "market"],
      atmosphere: "Loud, commercial, relentlessly bright",
      avgPriceLevel: 2,
      bestTimeToVisit: "Early evening for street food, before 9pm crowds peak",
      popularActivities: ["Skincare shopping sprees", "Street food alley crawl", "Myeongdong Cathedral visit"],
      rating: 4.1,
      reviewCount: 10,
    },
    {
      name: "Hannam",
      citySlug: "seoul",
      tagline: "Quiet wealth, embassy row, design galleries",
      description:
        "Tucked between Itaewon and the Han River, Hannam mixes ambassador residences with some of Seoul's most understated luxury boutiques and design galleries.",
      center: { lat: 37.5344, lng: 127.0021 },
      vibeTags: ["shopping", "art", "wellness"],
      atmosphere: "Understated, moneyed, architecturally striking",
      avgPriceLevel: 4,
      bestTimeToVisit: "Weekend afternoons for gallery openings",
      popularActivities: ["Leeum Museum of Art", "Concept boutique visits", "Han River sunset walks"],
      rating: 4.5,
      reviewCount: 6,
    },
    {
      name: "Apgujeong",
      citySlug: "seoul",
      tagline: "K-pop agencies and Rodeo Street glamour",
      description:
        "Home to major entertainment agency buildings and the Rodeo Street shopping strip, this is where idol sightings and flagship fashion collide.",
      center: { lat: 37.5274, lng: 127.0286 },
      vibeTags: ["shopping", "kpop", "nightlife"],
      atmosphere: "Glamorous, idol-adjacent, camera-ready",
      avgPriceLevel: 4,
      bestTimeToVisit: "Weekday afternoons, away from agency-gate crowds",
      popularActivities: ["Entertainment agency building tours", "Rodeo Street shopping", "Idol café hopping"],
      rating: 4.4,
      reviewCount: 7,
    },
    {
      name: "Yeonnam",
      citySlug: "seoul",
      tagline: "Hongdae's calmer, café-lined sibling",
      description:
        "A residential grid of tree-lined streets just west of Hongdae, known for its slow-mornings café culture and the Gyeongui Line Book Street park.",
      center: { lat: 37.5615, lng: 126.9256 },
      vibeTags: ["cafe", "art"],
      atmosphere: "Slow, leafy, photogenic",
      avgPriceLevel: 2,
      bestTimeToVisit: "Weekday mornings for quiet café time",
      popularActivities: ["Gyeongui Line Book Street picnic", "Specialty coffee crawl", "Independent bookstore hopping"],
      rating: 4.6,
      reviewCount: 9,
      featured: true,
    },
    {
      name: "Haeundae",
      citySlug: "busan",
      tagline: "Busan's beach-and-skyline showcase",
      description:
        "Korea's most famous beach district, backed by a wall of high-rises, hot springs, and the LCT Sky observation deck.",
      center: { lat: 35.1587, lng: 129.1604 },
      vibeTags: ["nature", "nightlife", "wellness"],
      atmosphere: "Resort-town energy with a skyline backdrop",
      avgPriceLevel: 3,
      bestTimeToVisit: "Sunset, and summer evenings for the beach festival scene",
      popularActivities: ["Haeundae Beach walk", "Dongbaek Island coastal trail", "Spa Land jjimjilbang"],
      rating: 4.5,
      reviewCount: 8,
      featured: true,
    },
    {
      name: "Jeju City Old Town",
      citySlug: "jeju",
      tagline: "Black-stone streets and haenyeo markets",
      description:
        "Jeju's historic port district, anchored by Dongmun Market's seafood stalls and the black basalt walls that define the island's architecture.",
      center: { lat: 33.5107, lng: 126.5219 },
      vibeTags: ["market", "nature", "traditional"],
      atmosphere: "Salt-air, unhurried, deeply local",
      avgPriceLevel: 2,
      bestTimeToVisit: "Early morning at Dongmun Market",
      popularActivities: ["Dongmun Market seafood crawl", "Black-stone alley walks", "Haenyeo diving show"],
      rating: 4.6,
      reviewCount: 5,
    },
  ];

  const neighborhoods = await Neighborhood.insertMany(
    neighborhoodDefs.map((n) => ({
      ...n,
      slug: slugify(n.name),
      city: cityBySlug[n.citySlug]._id,
      heroImage: img(`${slugify(n.name)}-hero`),
      gallery: [img(`${slugify(n.name)}-1`), img(`${slugify(n.name)}-2`), img(`${slugify(n.name)}-3`)],
    })),
  );
  const nbhdBySlug = Object.fromEntries(neighborhoods.map((n) => [n.slug, n]));
  console.log(`[seed] neighborhoods: ${neighborhoods.length}`);

  // -------------------------------------------------------------- PLACES
  const placeDefs = [
    // Hongdae
    { name: "Club Ellui Underground", nbhd: "hongdae", category: "nightlife", price: 3, tags: ["techno", "live-dj", "late-night"], desc: "A basement techno room where Seoul's underground DJs play until sunrise.", rating: 4.6, reviews: 42 },
    { name: "Thanks Nature Café", nbhd: "hongdae", category: "cafe", price: 2, tags: ["sheep", "photo-spot", "brunch"], desc: "A pastoral rooftop café with live sheep — one of Hongdae's most photographed spots.", rating: 4.2, reviews: 61 },
    { name: "Hongdae Free Market", nbhd: "hongdae", category: "market", price: 1, tags: ["handmade", "weekend", "art"], desc: "A weekend artist market for handmade jewelry, prints, and street food.", rating: 4.4, reviews: 33 },
    { name: "Vinyl & Vice Record Bar", nbhd: "hongdae", category: "bar", price: 2, tags: ["vinyl", "indie", "cocktails"], desc: "A vinyl-only bar spinning Korean indie and city pop until 3am.", rating: 4.7, reviews: 28 },
    { name: "Style Nanda Pink Pool Café", nbhd: "hongdae", category: "cafe", price: 2, tags: ["fashion", "photo-spot"], desc: "A hot-pink concept café from the Style Nanda fashion brand.", rating: 4.0, reviews: 19 },
    // Gangnam
    { name: "COEX Starfield Library", nbhd: "gangnam", category: "landmark", price: 1, tags: ["architecture", "free", "photo-spot"], desc: "A soaring public library inside a shopping mall, with 13-meter bookshelves.", rating: 4.8, reviews: 120 },
    { name: "Le Chamber Speakeasy", nbhd: "gangnam", category: "bar", price: 4, tags: ["cocktails", "hidden", "luxury"], desc: "A hidden bar behind a bookshelf door serving award-winning craft cocktails.", rating: 4.7, reviews: 55 },
    { name: "Apgujeong Rodeo Flagship Row", nbhd: "gangnam", category: "shopping", price: 4, tags: ["luxury", "fashion"], desc: "A concentrated strip of Korean and international flagship fashion stores.", rating: 4.3, reviews: 22 },
    { name: "Banpo Rainbow Bridge Fountain", nbhd: "gangnam", category: "landmark", price: 1, tags: ["free", "night-view", "romantic"], desc: "The world's longest bridge fountain, lit up nightly over the Han River.", rating: 4.6, reviews: 88 },
    { name: "Gangnam Jjimjilbang Spa", nbhd: "gangnam", category: "wellness", price: 2, tags: ["spa", "sauna", "relax"], desc: "A 24-hour Korean bathhouse with themed sauna rooms and rooftop terraces.", rating: 4.4, reviews: 47 },
    // Itaewon
    { name: "Gyeongnidan Rooftop Taco Bar", nbhd: "itaewon", category: "restaurant", price: 2, tags: ["tacos", "rooftop", "casual"], desc: "Korean-Mexican fusion tacos with skyline views over Namsan Tower.", rating: 4.3, reviews: 40 },
    { name: "Itaewon Antique Furniture Row", nbhd: "itaewon", category: "shopping", price: 3, tags: ["antiques", "design"], desc: "A strip of import antique and mid-century furniture dealers.", rating: 4.1, reviews: 14 },
    { name: "Prost Craft Beer Garden", nbhd: "itaewon", category: "bar", price: 2, tags: ["craft-beer", "outdoor"], desc: "Seoul's original craft beer taproom with a rotating list of Korean microbrews.", rating: 4.5, reviews: 63 },
    { name: "World Food Alley", nbhd: "itaewon", category: "restaurant", price: 2, tags: ["international", "halal", "diverse"], desc: "A single block housing Nigerian, Turkish, Indian, and Moroccan kitchens.", rating: 4.4, reviews: 51 },
    // Seongsu
    { name: "Onion Seongsu Café", nbhd: "seongsu", category: "cafe", price: 2, tags: ["industrial", "bakery", "photo-spot"], desc: "A converted factory bakery-café that defined Seongsu's industrial-chic aesthetic.", rating: 4.6, reviews: 210 },
    { name: "Seoul Forest Park", nbhd: "seongsu", category: "nature", price: 1, tags: ["free", "deer", "picnic"], desc: "A riverside forest park with a deer enclosure and cycling paths.", rating: 4.7, reviews: 95 },
    { name: "Daelim Warehouse Concept Store", nbhd: "seongsu", category: "shopping", price: 3, tags: ["design", "concept-store"], desc: "A raw-concrete concept store mixing furniture, fashion, and art installations.", rating: 4.5, reviews: 29 },
    { name: "LCDC Seoul", nbhd: "seongsu", category: "shopping", price: 3, tags: ["fashion", "streetwear"], desc: "A multi-floor streetwear and lifestyle concept building.", rating: 4.4, reviews: 24 },
    { name: "Common Ground Container Mall", nbhd: "seongsu", category: "shopping", price: 2, tags: ["shipping-containers", "streetwear"], desc: "Asia's first shipping-container shopping mall, home to indie streetwear labels.", rating: 4.3, reviews: 37 },
    // Myeongdong
    { name: "Myeongdong Street Food Alley", nbhd: "myeongdong", category: "market", price: 1, tags: ["street-food", "night-market"], desc: "A dense night alley of tteokbokki, skewers, and hotteok carts.", rating: 4.3, reviews: 140 },
    { name: "Nature Republic Flagship", nbhd: "myeongdong", category: "shopping", price: 2, tags: ["k-beauty", "skincare"], desc: "A flagship K-beauty store with photo-op aloe vera decor.", rating: 4.0, reviews: 45 },
    { name: "Myeongdong Cathedral", nbhd: "myeongdong", category: "culture", price: 1, tags: ["history", "architecture", "free"], desc: "Korea's first Gothic-style cathedral and a symbol of the democracy movement.", rating: 4.5, reviews: 30 },
    // Hannam
    { name: "Leeum Museum of Art", nbhd: "hannam", category: "art", price: 3, tags: ["museum", "contemporary-art"], desc: "A Samsung-family museum pairing traditional Korean art with global contemporary works.", rating: 4.8, reviews: 66 },
    { name: "Hannam-dong Han River Terrace", nbhd: "hannam", category: "nature", price: 1, tags: ["sunset", "free", "walk"], desc: "A quiet riverside terrace popular for sunset views away from tourist crowds.", rating: 4.5, reviews: 21 },
    { name: "Studio Concrete Gallery Café", nbhd: "hannam", category: "cafe", price: 3, tags: ["gallery", "minimal"], desc: "A minimalist concrete-and-glass café doubling as a rotating art gallery.", rating: 4.6, reviews: 18 },
    // Apgujeong
    { name: "SM Entertainment COEX Artium", nbhd: "apgujeong", category: "kpop", price: 2, tags: ["kpop", "photocard", "merch"], desc: "An official SM Entertainment experience store with holograms and merch.", rating: 4.5, reviews: 71 },
    { name: "Rodeo Street Flagship Boutiques", nbhd: "apgujeong", category: "shopping", price: 4, tags: ["fashion", "luxury"], desc: "Designer flagship stores lining Apgujeong's most photographed shopping street.", rating: 4.3, reviews: 25 },
    { name: "Idol Photocard Café", nbhd: "apgujeong", category: "kpop", price: 2, tags: ["kpop", "cafe", "photocard"], desc: "A themed café trading and displaying K-pop photocards.", rating: 4.4, reviews: 34 },
    // Yeonnam
    { name: "Gyeongui Line Book Street", nbhd: "yeonnam", category: "culture", price: 1, tags: ["books", "free", "park"], desc: "A converted rail line turned linear park lined with bookshops and reading pods.", rating: 4.6, reviews: 58 },
    { name: "Fritz Coffee Company", nbhd: "yeonnam", category: "cafe", price: 2, tags: ["specialty-coffee", "roastery"], desc: "One of Seoul's most acclaimed specialty roasteries, founded by championship baristas.", rating: 4.8, reviews: 132 },
    { name: "Yeonnam-dong 3-Chome", nbhd: "yeonnam", category: "restaurant", price: 2, tags: ["japanese-korean-fusion"], desc: "A Japanese-Korean fusion izakaya famous for its egg-drop curry rice.", rating: 4.5, reviews: 89 },
    // Haeundae (Busan)
    { name: "Haeundae Beach Boardwalk", nbhd: "haeundae", category: "nature", price: 1, tags: ["beach", "free", "sunset"], desc: "Korea's most iconic beach, backed by the Marine City skyline.", rating: 4.6, reviews: 210 },
    { name: "Spa Land Centum City", nbhd: "haeundae", category: "wellness", price: 3, tags: ["spa", "sauna", "luxury"], desc: "A luxury jjimjilbang inside the world's largest department store.", rating: 4.7, reviews: 98 },
    { name: "Dongbaek Island Coastal Trail", nbhd: "haeundae", category: "nature", price: 1, tags: ["hiking", "free", "ocean-view"], desc: "A short pine-forest loop trail with dramatic ocean cliff views.", rating: 4.5, reviews: 41 },
    { name: "Gwangalli Night Beach Bars", nbhd: "haeundae", category: "bar", price: 2, tags: ["beach-bar", "night-view"], desc: "Beachfront bars looking straight at the Gwangan Bridge light show.", rating: 4.4, reviews: 56 },
    // Jeju
    { name: "Dongmun Traditional Market", nbhd: "jeju-city-old-town", category: "market", price: 1, tags: ["seafood", "street-food", "local"], desc: "Jeju's oldest market, packed with fresh hairtail, citrus, and black-pork skewers.", rating: 4.5, reviews: 74 },
    { name: "Seongsan Ilchulbong Sunrise Peak", nbhd: "jeju-city-old-town", category: "nature", price: 1, tags: ["hiking", "sunrise", "unesco"], desc: "A UNESCO-listed volcanic tuff cone famous for sunrise hikes.", rating: 4.9, reviews: 300 },
    { name: "Haenyeo Diving Performance", nbhd: "jeju-city-old-town", category: "culture", price: 2, tags: ["traditional", "diving", "unesco"], desc: "A live demonstration by Jeju's legendary free-diving haenyeo women.", rating: 4.7, reviews: 38 },
  ];

  const cityForNbhd = (slug) => nbhdBySlug[slug].city;
  const places = await Place.insertMany(
    placeDefs.map((p) => ({
      name: p.name,
      slug: slugify(p.name),
      city: cityForNbhd(p.nbhd),
      neighborhood: nbhdBySlug[p.nbhd]._id,
      category: p.category,
      description: p.desc,
      images: [img(`${slugify(p.name)}-1`), img(`${slugify(p.name)}-2`)],
      address: `${nbhdBySlug[p.nbhd].name}, Korea`,
      location: { type: "Point", coordinates: [nbhdBySlug[p.nbhd].center.lng + (Math.random() - 0.5) * 0.01, nbhdBySlug[p.nbhd].center.lat + (Math.random() - 0.5) * 0.01] },
      priceLevel: p.price,
      tags: p.tags,
      rating: p.rating,
      reviewCount: p.reviews,
      viewCount: Math.round(p.reviews * (3 + Math.random() * 4)),
      saveCount: Math.round(p.reviews * 0.6),
      isDramaLocation: Math.random() > 0.85,
      featured: p.rating >= 4.6,
    })),
  );
  console.log(`[seed] places: ${places.length}`);
  const placeByName = Object.fromEntries(places.map((p) => [p.name, p]));

  // Update neighborhood/city stats
  for (const n of neighborhoods) {
    const count = await Place.countDocuments({ neighborhood: n._id });
    n.saveCount = Math.round(count * 12.5);
    await n.save();
  }
  for (const c of cities) {
    const [neighborhoodCount, placeCount, avgAgg] = await Promise.all([
      Neighborhood.countDocuments({ city: c._id }),
      Place.countDocuments({ city: c._id }),
      Place.aggregate([{ $match: { city: c._id } }, { $group: { _id: null, avg: { $avg: "$rating" } } }]),
    ]);
    c.stats = {
      neighborhoodCount,
      placeCount,
      eventCount: 0,
      avgRating: Number((avgAgg[0]?.avg || 0).toFixed(2)),
    };
    await c.save();
  }

  // ---------------------------------------------------------------- FOOD
  const foodDefs = [
    { ko: "삼겹살", en: "Samgyeopsal (Grilled Pork Belly)", cat: "bbq", spice: 0, region: "Nationwide", desc: "Thick-cut pork belly grilled tableside and wrapped in lettuce with garlic and ssamjang.", price: "₩15,000–20,000", pop: 98 },
    { ko: "떡볶이", en: "Tteokbokki (Spicy Rice Cakes)", cat: "street-food", spice: 3, region: "Nationwide", desc: "Chewy rice cakes simmered in a sweet-spicy gochujang sauce — Korea's ultimate street snack.", price: "₩3,000–6,000", pop: 95 },
    { ko: "김치찌개", en: "Kimchi Jjigae (Kimchi Stew)", cat: "soups-stews", spice: 3, region: "Nationwide", desc: "A bubbling stew of aged kimchi, pork, and tofu — the definitive Korean home-cooked comfort food.", price: "₩8,000–10,000", pop: 90 },
    { ko: "비빔밥", en: "Bibimbap (Mixed Rice Bowl)", cat: "traditional", spice: 1, region: "Jeonju", desc: "Rice topped with seasoned vegetables, beef, and a fried egg, mixed tableside with gochujang.", price: "₩9,000–13,000", pop: 88 },
    { ko: "냉면", en: "Naengmyeon (Cold Buckwheat Noodles)", cat: "noodles", spice: 0, region: "Pyongyang / Hamhung", desc: "Chewy buckwheat noodles in an icy beef broth — a summer staple since the Korean War era.", price: "₩10,000–13,000", pop: 76 },
    { ko: "짜장면", en: "Jjajangmyeon (Black Bean Noodles)", cat: "noodles", spice: 0, region: "Incheon", desc: "Korean-Chinese noodles tossed in a savory black bean sauce, born in Incheon's Chinatown.", price: "₩6,000–8,000", pop: 92 },
    { ko: "순두부찌개", en: "Sundubu Jjigae (Soft Tofu Stew)", cat: "soups-stews", spice: 3, region: "Nationwide", desc: "A fiery stew of uncurdled silken tofu, often with seafood, served bubbling in a stone pot.", price: "₩8,000–11,000", pop: 84 },
    { ko: "붕어빵", en: "Bungeoppang (Fish-Shaped Pastry)", cat: "street-food", spice: 0, region: "Nationwide", desc: "A fish-shaped waffle pastry filled with sweet red bean paste, sold at winter street carts.", price: "₩1,000–2,000", pop: 80 },
    { ko: "삼계탕", en: "Samgyetang (Ginseng Chicken Soup)", cat: "soups-stews", spice: 0, region: "Nationwide", desc: "A whole young chicken stuffed with rice and ginseng, simmered for a restorative summer broth.", price: "₩16,000–20,000", pop: 70 },
    { ko: "빙수", en: "Bingsu (Shaved Ice Dessert)", cat: "desserts", spice: 0, region: "Nationwide", desc: "Fluffy shaved milk ice topped with red beans, fruit, or injeolmi rice cake powder.", price: "₩8,000–14,000", pop: 82 },
    { ko: "호떡", en: "Hotteok (Sweet Filled Pancake)", cat: "street-food", spice: 0, region: "Nationwide", desc: "A pan-fried pancake oozing brown sugar, cinnamon, and crushed nuts.", price: "₩1,500–2,500", pop: 79 },
    { ko: "곱창구이", en: "Gopchang-gui (Grilled Beef Intestines)", cat: "bbq", spice: 1, region: "Daegu", desc: "Chewy grilled beef intestines, a beloved late-night soju pairing.", price: "₩18,000–25,000", pop: 55 },
    { ko: "떡국", en: "Tteokguk (Rice Cake Soup)", cat: "traditional", spice: 0, region: "Nationwide", desc: "A clear beef-broth soup with sliced rice cakes, traditionally eaten on Lunar New Year.", price: "₩8,000–10,000", pop: 64 },
    { ko: "닭갈비", en: "Dakgalbi (Spicy Stir-Fried Chicken)", cat: "bbq", spice: 3, region: "Chuncheon", desc: "Marinated chicken stir-fried tableside with cabbage, rice cakes, and sweet potato.", price: "₩13,000–16,000", pop: 81 },
    { ko: "라면", en: "Ramyeon (Instant Noodles)", cat: "convenience-store", spice: 2, region: "Nationwide", desc: "Convenience-store ramyeon cooked in-store — a 24-hour survival meal for every budget traveler.", price: "₩1,500–4,000", pop: 96 },
    { ko: "삼각김밥", en: "Samgak Gimbap (Triangle Rice Ball)", cat: "convenience-store", spice: 0, region: "Nationwide", desc: "A seaweed-wrapped triangular rice snack sold at every convenience store.", price: "₩1,200–1,800", pop: 85 },
    { ko: "아메리카노", en: "Iced Americano", cat: "cafe-drinks", spice: 0, region: "Nationwide", desc: "Korea's default coffee order, drunk year-round regardless of weather.", price: "₩3,500–5,500", pop: 93 },
    { ko: "약과", en: "Yakgwa (Honey Cookie)", cat: "traditional", spice: 0, region: "Nationwide", desc: "A deep-fried honey-ginger cookie soaked in syrup, a traditional tea-time sweet turned modern café trend.", price: "₩3,000–5,000", pop: 60 },
    { ko: "회", en: "Hoe (Korean Sashimi)", cat: "regional", spice: 0, region: "Busan / Jeju", desc: "Fresh raw fish served with vinegar-gochujang and shiso leaves, best eaten portside in Busan.", price: "₩25,000–45,000", pop: 72 },
    { ko: "흑돼지구이", en: "Heuk-dwaeji (Jeju Black Pork BBQ)", cat: "regional", spice: 0, region: "Jeju", desc: "Jeju's prized black-pig pork, grilled thick and served with fermented shrimp sauce.", price: "₩20,000–28,000", pop: 77 },
  ];

  const foods = await Food.insertMany(
    foodDefs.map((f) => ({
      nameKorean: f.ko,
      nameEnglish: f.en,
      slug: slugify(f.en),
      category: f.cat,
      description: f.desc,
      ingredients: [],
      origin: f.region,
      region: f.region,
      priceRange: f.price,
      spiceLevel: f.spice,
      images: [img(`${slugify(f.en)}-1`)],
      rating: Number((4 + Math.random() * 0.9).toFixed(1)),
      reviewCount: Math.round(f.pop / 2),
      popularityScore: f.pop,
    })),
  );
  console.log(`[seed] food: ${foods.length}`);

  // link some food to places
  await Food.findOneAndUpdate({ nameEnglish: /Samgyeopsal/ }, { recommendedPlaces: [] });
  await Food.findOneAndUpdate(
    { nameEnglish: /Tteokbokki/ },
    { recommendedPlaces: [placeByName["Myeongdong Street Food Alley"]._id] },
  );
  await Food.findOneAndUpdate(
    { nameEnglish: /Ramyeon/ },
    { recommendedPlaces: [placeByName["Myeongdong Street Food Alley"]._id] },
  );
  await Food.findOneAndUpdate(
    { nameEnglish: /Hoe \(Korean/ },
    { recommendedPlaces: [placeByName["Gwangalli Night Beach Bars"]._id] },
  );
  await Food.findOneAndUpdate(
    { nameEnglish: /Jeju Black Pork/ },
    { recommendedPlaces: [placeByName["Dongmun Traditional Market"]._id] },
  );

  // -------------------------------------------------------------- CULTURE
  const cultureDefs = [
    { title: "Inside a K-pop Trainee System", type: "kpop", nbhd: "apgujeong", summary: "How entertainment agencies scout, train, and debut idols — and why Apgujeong is ground zero.", tags: ["kpop", "agency", "idol"] },
    { title: "Filming Locations of Seoul's Biggest K-Dramas", type: "kdrama", nbhd: "seongsu", summary: "From Seongsu cafés to Han River benches — the real places behind iconic drama scenes.", tags: ["kdrama", "filming-location"] },
    { title: "The Rise of Korean Streetwear", type: "street-culture", nbhd: "seongsu", summary: "How Seongsu's converted warehouses became the epicenter of Korea's independent fashion labels.", tags: ["fashion", "streetwear"] },
    { title: "Glass Skin: Inside K-Beauty's 10-Step Obsession", type: "beauty", nbhd: "myeongdong", summary: "The skincare philosophy that turned Myeongdong into a beauty pilgrimage site.", tags: ["beauty", "skincare"] },
    { title: "Gyeongbokgung in Hanbok: A Living Palace", type: "traditional", nbhd: null, summary: "Why renting a hanbok for free palace entry has become Seoul's most photographed ritual.", tags: ["traditional", "hanbok", "palace"] },
    { title: "Busan International Film Festival, Explained", type: "cinema", nbhd: "haeundae", summary: "How a regional festival became Asia's biggest cinema showcase.", tags: ["cinema", "festival"] },
    { title: "Hongdae's Underground Music Scene", type: "street-culture", nbhd: "hongdae", summary: "Inside the indie clubs keeping Korea's non-idol music scene alive.", tags: ["music", "indie", "underground"] },
    { title: "The Return of Hanbok-Inspired Fashion", type: "fashion", nbhd: "apgujeong", summary: "Modern designers are reworking traditional silhouettes for Seoul Fashion Week runways.", tags: ["fashion", "hanbok"] },
    { title: "Gwangju Biennale: Asia's Contemporary Art Stage", type: "festival", nbhd: null, summary: "How Gwangju turned a democratic history into one of Asia's premier art events.", tags: ["art", "festival"] },
    { title: "Jeju's Haenyeo: The Sea Women of Korea", type: "traditional", nbhd: "jeju-city-old-town", summary: "A UNESCO-recognized diving tradition carried on by Jeju's aging female free-divers.", tags: ["traditional", "unesco", "jeju"] },
  ];

  const cultureItems = await Culture.insertMany(
    cultureDefs.map((c) => ({
      title: c.title,
      slug: slugify(c.title),
      type: c.type,
      summary: c.summary,
      body: `${c.summary} DONGNE connects this story to the real neighborhoods, places, and food where it plays out today.`,
      images: [img(`${slugify(c.title)}-1`)],
      relatedNeighborhood: c.nbhd ? nbhdBySlug[c.nbhd]._id : undefined,
      relatedCity: c.nbhd ? nbhdBySlug[c.nbhd].city : cities[0]._id,
      tags: c.tags,
      popularityScore: Math.round(50 + Math.random() * 50),
      featured: Math.random() > 0.5,
    })),
  );
  console.log(`[seed] culture: ${cultureItems.length}`);

  // --------------------------------------------------------------- EVENTS
  const eventDefs = [
    { title: "Hongdae Rooftop Music Night", type: "concert", nbhd: "hongdae", days: 3, price: "₩20,000" },
    { title: "Seongsu Design Pop-Up Weekend", type: "pop-up", nbhd: "seongsu", days: 6, price: "Free" },
    { title: "Gangnam K-Beauty Trade Expo", type: "exhibition", nbhd: "gangnam", days: 10, price: "₩10,000" },
    { title: "Itaewon Global Village Festival", type: "festival", nbhd: "itaewon", days: 14, price: "Free" },
    { title: "Yeonnam Book Street Poetry Market", type: "market", nbhd: "yeonnam", days: 5, price: "Free" },
    { title: "Apgujeong Idol Fan-Sign Showcase", type: "performance", nbhd: "apgujeong", days: 9, price: "₩35,000" },
    { title: "Haeundae Beach Fireworks Festival", type: "festival", nbhd: "haeundae", days: 20, price: "Free" },
    { title: "Jeju Haenyeo Cultural Festival", type: "cultural", nbhd: "jeju-city-old-town", days: 25, price: "Free" },
    { title: "Myeongdong Night Market Street Food Fest", type: "market", nbhd: "myeongdong", days: 2, price: "Free" },
    { title: "Hannam Contemporary Art Exhibition", type: "exhibition", nbhd: "hannam", days: 12, price: "₩15,000" },
  ];

  const events = await Event.insertMany(
    eventDefs.map((e) => ({
      title: e.title,
      slug: slugify(e.title),
      type: e.type,
      description: `${e.title} brings together the best of ${nbhdBySlug[e.nbhd].name}'s local scene for one standout day.`,
      images: [img(`${slugify(e.title)}-1`)],
      city: nbhdBySlug[e.nbhd].city,
      neighborhood: nbhdBySlug[e.nbhd]._id,
      venueName: `${nbhdBySlug[e.nbhd].name} Central`,
      startDate: daysFromNow(e.days),
      endDate: daysFromNow(e.days, 23),
      priceRange: e.price,
      tags: [e.type],
      saveCount: Math.round(Math.random() * 40),
      featured: e.days <= 10,
    })),
  );
  console.log(`[seed] events: ${events.length}`);

  for (const c of cities) {
    await City.findByIdAndUpdate(c._id, { "stats.eventCount": await Event.countDocuments({ city: c._id }) });
  }

  // ------------------------------------------------------- LANGUAGE LESSONS
  const lessonDefs = [
    // ------------------------------------------------------------ KOREAN
    {
      language: "ko",
      title: "Hangul Basics: Reading Your First Words",
      category: "alphabet",
      level: 1,
      order: 1,
      description: "Learn Korea's phonetic alphabet and read your first real words.",
      vocab: [
        { target: "안녕", romanization: "annyeong", translation: "hi / bye (casual)", example: "안녕! 잘 지내? — Hi! How are you?" },
        { target: "감사", romanization: "gamsa", translation: "thanks (root)", example: "감사합니다 — Thank you (formal)" },
        { target: "사람", romanization: "saram", translation: "person", example: "그 사람은 친절해요 — That person is kind" },
        { target: "물", romanization: "mul", translation: "water", example: "물 좀 주세요 — Water please" },
        { target: "집", romanization: "jip", translation: "house / home", example: "집에 가요 — I'm going home" },
      ],
    },
    {
      language: "ko",
      title: "Greetings Every Traveler Needs",
      category: "greetings",
      level: 1,
      order: 2,
      description: "The essential polite phrases for your first day in Korea.",
      vocab: [
        { target: "안녕하세요", romanization: "annyeonghaseyo", translation: "hello (polite)", example: "Used any time of day with strangers" },
        { target: "감사합니다", romanization: "gamsahamnida", translation: "thank you", example: "Formal, safe in any situation" },
        { target: "죄송합니다", romanization: "joesonghamnida", translation: "I'm sorry", example: "For a real apology or bumping into someone" },
        { target: "실례합니다", romanization: "sillyehamnida", translation: "excuse me", example: "To get someone's attention politely" },
        { target: "만나서 반가워요", romanization: "mannaseo bangawoyo", translation: "nice to meet you", example: "Said after an introduction" },
      ],
    },
    {
      language: "ko",
      title: "Ordering Food Like a Local",
      category: "food",
      level: 2,
      order: 3,
      description: "Phrases to order, ask for spice levels, and pay the bill.",
      vocab: [
        { target: "이거 주세요", romanization: "igeo juseyo", translation: "this one, please", example: "Point at the menu and say this" },
        { target: "맵지 않게 해주세요", romanization: "maepji anke haejuseyo", translation: "please make it not spicy", example: "Essential for spice-sensitive travelers" },
        { target: "맛있어요", romanization: "masisseoyo", translation: "it's delicious", example: "A compliment any restaurant owner loves" },
        { target: "계산해 주세요", romanization: "gyesanhae juseyo", translation: "check, please", example: "Said at the counter, not the table" },
        { target: "하나 더 주세요", romanization: "hana deo juseyo", translation: "one more, please", example: "For free banchan refills" },
      ],
    },
    {
      language: "ko",
      title: "Finding Your Way Around",
      category: "directions",
      level: 2,
      order: 4,
      description: "Navigate the subway, taxis, and street directions.",
      vocab: [
        { target: "여기가 어디예요?", romanization: "yeogiga eodiyeyo", translation: "where is this?", example: "Show your phone map while asking" },
        { target: "왼쪽", romanization: "oenjjok", translation: "left", example: "왼쪽으로 가세요 — go left" },
        { target: "오른쪽", romanization: "oreunjjok", translation: "right", example: "오른쪽으로 가세요 — go right" },
        { target: "직진", romanization: "jikjin", translation: "straight ahead", example: "Common taxi driver instruction" },
        { target: "여기서 내려주세요", romanization: "yeogiseo naeryeojuseyo", translation: "please let me off here", example: "For taxis and buses" },
      ],
    },
    {
      language: "ko",
      title: "Shopping & Bargaining Basics",
      category: "shopping",
      level: 3,
      order: 5,
      description: "Ask for sizes, prices, and discounts at markets.",
      vocab: [
        { target: "얼마예요?", romanization: "eolmayeyo", translation: "how much is it?", example: "The single most useful shopping phrase" },
        { target: "더 싸게 해주세요", romanization: "deo ssage haejuseyo", translation: "can you make it cheaper", example: "Works best at markets, not chain stores" },
        { target: "다른 색 있어요?", romanization: "dareun saek isseoyo", translation: "do you have another color?", example: "Common in Myeongdong boutiques" },
        { target: "입어봐도 돼요?", romanization: "ibeobwado dwaeyo", translation: "can I try it on?", example: "Ask before fitting rooms" },
        { target: "이거 살게요", romanization: "igeo salgeyo", translation: "I'll buy this", example: "Confirming a purchase" },
      ],
    },
    {
      language: "ko",
      title: "Slang You'll Actually Hear",
      category: "slang",
      level: 4,
      order: 6,
      description: "Casual expressions used by young Koreans in Hongdae and online.",
      vocab: [
        { target: "대박", romanization: "daebak", translation: "awesome / no way", example: "Reaction to anything surprising or great" },
        { target: "완전", romanization: "wanjeon", translation: "totally / super", example: "완전 좋아요 — I totally love it" },
        { target: "핵인싸", romanization: "haek-inssa", translation: "super social/popular person", example: "Opposite of 아싸 (outsider)" },
        { target: "TMI", romanization: "T-M-I", translation: "too much information", example: "Used exactly like in English, but very common" },
        { target: "빵터졌어", romanization: "ppang-teojyeosseo", translation: "I burst out laughing", example: "For something genuinely hilarious" },
      ],
    },
    {
      language: "ko",
      title: "Travel Phrases for Emergencies",
      category: "travel",
      level: 3,
      order: 7,
      description: "Phrases for lost items, help, and getting around safely.",
      vocab: [
        { target: "도와주세요", romanization: "dowajuseyo", translation: "please help me", example: "Universal emergency phrase" },
        { target: "병원이 어디예요?", romanization: "byeongwoni eodiyeyo", translation: "where is the hospital?", example: "Say slowly and point at a map" },
        { target: "지갑을 잃어버렸어요", romanization: "jigabeul ireobeoryeosseoyo", translation: "I lost my wallet", example: "Report to police box (파출소)" },
        { target: "영어 하시는 분 있어요?", romanization: "yeongeo hasineun bun isseoyo", translation: "does anyone speak English?", example: "Polite way to ask in a crowd" },
        { target: "여기서 가까운 편의점이 어디예요?", romanization: "yeogiseo gakkaun pyeonuijeomi eodiyeyo", translation: "where's the nearest convenience store?", example: "You'll use this a lot" },
      ],
    },

    // ------------------------------------------------------------ RUSSIAN
    {
      language: "ru",
      title: "Cyrillic Basics: Reading Your First Words",
      category: "alphabet",
      level: 1,
      order: 1,
      description: "Learn the Cyrillic alphabet and read your first real words.",
      vocab: [
        { target: "привет", romanization: "privet", translation: "hi (casual)", example: "Привет! Как дела? — Hi! How are you?" },
        { target: "спасибо", romanization: "spasibo", translation: "thanks", example: "Спасибо большое — Thanks a lot" },
        { target: "человек", romanization: "chelovek", translation: "person", example: "Этот человек добрый — That person is kind" },
        { target: "вода", romanization: "voda", translation: "water", example: "Дайте воды, пожалуйста — Water please" },
        { target: "дом", romanization: "dom", translation: "house / home", example: "Я иду домой — I'm going home" },
      ],
    },
    {
      language: "ru",
      title: "Greetings Every Traveler Needs",
      category: "greetings",
      level: 1,
      order: 2,
      description: "The essential polite phrases for your first day in Russia.",
      vocab: [
        { target: "здравствуйте", romanization: "zdravstvuyte", translation: "hello (polite)", example: "Used with strangers or in formal settings" },
        { target: "спасибо большое", romanization: "spasibo bolshoye", translation: "thank you very much", example: "Formal, safe in any situation" },
        { target: "извините", romanization: "izvinite", translation: "I'm sorry / excuse me", example: "For an apology or to get attention" },
        { target: "пожалуйста", romanization: "pozhaluysta", translation: "please / you're welcome", example: "Used both ways depending on context" },
        { target: "приятно познакомиться", romanization: "priyatno poznakomitsya", translation: "nice to meet you", example: "Said after an introduction" },
      ],
    },
    {
      language: "ru",
      title: "Ordering Food Like a Local",
      category: "food",
      level: 2,
      order: 3,
      description: "Phrases to order, ask about spice, and pay the bill.",
      vocab: [
        { target: "я хочу это", romanization: "ya khochu eto", translation: "I want this one", example: "Point at the menu and say this" },
        { target: "не остро, пожалуйста", romanization: "ne ostro, pozhaluysta", translation: "not spicy, please", example: "Essential for spice-sensitive travelers" },
        { target: "очень вкусно", romanization: "ochen vkusno", translation: "it's very delicious", example: "A compliment any restaurant owner loves" },
        { target: "счёт, пожалуйста", romanization: "schyot, pozhaluysta", translation: "check, please", example: "Said at the table" },
        { target: "ещё одну порцию", romanization: "yeshcho odnu portsiyu", translation: "one more portion", example: "For asking for a refill" },
      ],
    },
    {
      language: "ru",
      title: "Finding Your Way Around",
      category: "directions",
      level: 2,
      order: 4,
      description: "Navigate the metro, taxis, and street directions.",
      vocab: [
        { target: "где это находится?", romanization: "gde eto nakhoditsya", translation: "where is this?", example: "Show your phone map while asking" },
        { target: "налево", romanization: "nalevo", translation: "left", example: "Идите налево — go left" },
        { target: "направо", romanization: "napravo", translation: "right", example: "Идите направо — go right" },
        { target: "прямо", romanization: "pryamo", translation: "straight ahead", example: "Common taxi driver instruction" },
        { target: "остановите здесь", romanization: "ostanovite zdes", translation: "stop here please", example: "For taxis and buses" },
      ],
    },
    {
      language: "ru",
      title: "Shopping & Bargaining Basics",
      category: "shopping",
      level: 3,
      order: 5,
      description: "Ask for sizes, prices, and discounts at markets.",
      vocab: [
        { target: "сколько это стоит?", romanization: "skolko eto stoit", translation: "how much is it?", example: "The single most useful shopping phrase" },
        { target: "можно дешевле?", romanization: "mozhno deshevle", translation: "can it be cheaper?", example: "Works best at markets, not chain stores" },
        { target: "есть другой цвет?", romanization: "yest drugoy tsvet", translation: "is there another color?", example: "Common in clothing shops" },
        { target: "можно примерить?", romanization: "mozhno primerit", translation: "can I try it on?", example: "Ask before fitting rooms" },
        { target: "я это куплю", romanization: "ya eto kuplyu", translation: "I'll buy this", example: "Confirming a purchase" },
      ],
    },
    {
      language: "ru",
      title: "Slang You'll Actually Hear",
      category: "slang",
      level: 4,
      order: 6,
      description: "Casual expressions used by young Russians in everyday talk.",
      vocab: [
        { target: "круто", romanization: "kruto", translation: "cool / awesome", example: "Reaction to anything surprising or great" },
        { target: "жесть", romanization: "zhest", translation: "wow / intense", example: "Used for shocking or extreme situations" },
        { target: "чувак", romanization: "chuvak", translation: "dude / guy", example: "Casual way to refer to a guy" },
        { target: "капец", romanization: "kapets", translation: "no way / that's it", example: "Used like 'oh man' in English, very common" },
        { target: "я угораю", romanization: "ya ugorayu", translation: "I'm cracking up", example: "For something genuinely hilarious" },
      ],
    },
    {
      language: "ru",
      title: "Travel Phrases for Emergencies",
      category: "travel",
      level: 3,
      order: 7,
      description: "Phrases for lost items, help, and getting around safely.",
      vocab: [
        { target: "помогите, пожалуйста", romanization: "pomogite, pozhaluysta", translation: "please help me", example: "Universal emergency phrase" },
        { target: "где больница?", romanization: "gde bolnitsa", translation: "where is the hospital?", example: "Say slowly and point at a map" },
        { target: "я потерял кошелёк", romanization: "ya poteryal koshelyok", translation: "I lost my wallet", example: "Report to the nearest police station" },
        { target: "кто-то говорит по-английски?", romanization: "kto-to govorit po-angliyski", translation: "does anyone speak English?", example: "Polite way to ask in a crowd" },
        { target: "где ближайший магазин?", romanization: "gde blizhayshiy magazin", translation: "where's the nearest store?", example: "You'll use this a lot" },
      ],
    },

    // ------------------------------------------------------------- UZBEK
    {
      language: "uz",
      title: "Latin Alphabet Basics: Reading Your First Words",
      category: "alphabet",
      level: 1,
      order: 1,
      description: "Get comfortable with Uzbek's Latin script and read your first real words.",
      vocab: [
        { target: "salom", romanization: "salom", translation: "hi / hello (casual)", example: "Salom! Yaxshimisiz? — Hi! How are you?" },
        { target: "rahmat", romanization: "rahmat", translation: "thanks", example: "Katta rahmat — Thanks a lot" },
        { target: "odam", romanization: "odam", translation: "person", example: "U odam juda mehribon — That person is kind" },
        { target: "suv", romanization: "suv", translation: "water", example: "Suv bering, iltimos — Water please" },
        { target: "uy", romanization: "uy", translation: "house / home", example: "Men uyga ketyapman — I'm going home" },
      ],
    },
    {
      language: "uz",
      title: "Greetings Every Traveler Needs",
      category: "greetings",
      level: 1,
      order: 2,
      description: "The essential polite phrases for your first day in Uzbekistan.",
      vocab: [
        { target: "assalomu alaykum", romanization: "assalomu alaykum", translation: "hello (polite/formal)", example: "Used any time of day with strangers" },
        { target: "katta rahmat", romanization: "katta rahmat", translation: "thank you very much", example: "Formal, safe in any situation" },
        { target: "kechirasiz", romanization: "kechirasiz", translation: "I'm sorry / excuse me", example: "For an apology or to get attention" },
        { target: "iltimos", romanization: "iltimos", translation: "please", example: "Added to almost any polite request" },
        { target: "tanishganimdan xursandman", romanization: "tanishganimdan xursandman", translation: "nice to meet you", example: "Said after an introduction" },
      ],
    },
    {
      language: "uz",
      title: "Ordering Food Like a Local",
      category: "food",
      level: 2,
      order: 3,
      description: "Phrases to order, ask about spice, and pay the bill.",
      vocab: [
        { target: "shuni bering", romanization: "shuni bering", translation: "give me this one, please", example: "Point at the menu and say this" },
        { target: "achchiq bo'lmasin", romanization: "achchiq bo'lmasin", translation: "please make it not spicy", example: "Essential for spice-sensitive travelers" },
        { target: "juda mazali", romanization: "juda mazali", translation: "it's very delicious", example: "A compliment any restaurant owner loves" },
        { target: "hisobni bering", romanization: "hisobni bering", translation: "check, please", example: "Said at the counter or table" },
        { target: "yana bitta bering", romanization: "yana bitta bering", translation: "one more, please", example: "For asking for a refill" },
      ],
    },
    {
      language: "uz",
      title: "Finding Your Way Around",
      category: "directions",
      level: 2,
      order: 4,
      description: "Navigate taxis, buses, and street directions.",
      vocab: [
        { target: "bu yer qayerda?", romanization: "bu yer qayerda", translation: "where is this?", example: "Show your phone map while asking" },
        { target: "chapga", romanization: "chapga", translation: "left", example: "Chapga buriling — turn left" },
        { target: "o'ngga", romanization: "o'ngga", translation: "right", example: "O'ngga buriling — turn right" },
        { target: "to'g'riga", romanization: "to'g'riga", translation: "straight ahead", example: "Common taxi driver instruction" },
        { target: "shu yerda to'xtating", romanization: "shu yerda to'xtating", translation: "please stop here", example: "For taxis and buses" },
      ],
    },
    {
      language: "uz",
      title: "Shopping & Bargaining Basics",
      category: "shopping",
      level: 3,
      order: 5,
      description: "Ask for sizes, prices, and discounts at bazaars.",
      vocab: [
        { target: "bu qancha turadi?", romanization: "bu qancha turadi", translation: "how much is it?", example: "The single most useful shopping phrase" },
        { target: "arzonroq qiling", romanization: "arzonroq qiling", translation: "can you make it cheaper", example: "Works best at bazaars, not chain stores" },
        { target: "boshqa rangi bormi?", romanization: "boshqa rangi bormi", translation: "do you have another color?", example: "Common in clothing shops" },
        { target: "kiyib ko'rsam bo'ladimi?", romanization: "kiyib ko'rsam bo'ladimi", translation: "can I try it on?", example: "Ask before fitting rooms" },
        { target: "shuni olaman", romanization: "shuni olaman", translation: "I'll buy this", example: "Confirming a purchase" },
      ],
    },
    {
      language: "uz",
      title: "Slang You'll Actually Hear",
      category: "slang",
      level: 4,
      order: 6,
      description: "Casual expressions used by young Uzbeks in everyday talk.",
      vocab: [
        { target: "zo'r", romanization: "zo'r", translation: "awesome / great", example: "Reaction to anything surprising or great" },
        { target: "haqiqatan", romanization: "haqiqatan", translation: "seriously / really", example: "Haqiqatan zo'r ekan — It's really great" },
        { target: "aka", romanization: "aka", translation: "bro / older brother (casual address)", example: "Used to address a guy respectfully but casually" },
        { target: "xolos", romanization: "xolos", translation: "that's it / enough", example: "Used like 'that's all' in English" },
        { target: "kulib o'ldim", romanization: "kulib o'ldim", translation: "I died laughing", example: "For something genuinely hilarious" },
      ],
    },
    {
      language: "uz",
      title: "Travel Phrases for Emergencies",
      category: "travel",
      level: 3,
      order: 7,
      description: "Phrases for lost items, help, and getting around safely.",
      vocab: [
        { target: "yordam bering, iltimos", romanization: "yordam bering, iltimos", translation: "please help me", example: "Universal emergency phrase" },
        { target: "kasalxona qayerda?", romanization: "kasalxona qayerda", translation: "where is the hospital?", example: "Say slowly and point at a map" },
        { target: "hamyonimni yo'qotib qo'ydim", romanization: "hamyonimni yo'qotib qo'ydim", translation: "I lost my wallet", example: "Report to the nearest police station" },
        { target: "ingliz tilida gapiradigan bormi?", romanization: "ingliz tilida gapiradigan bormi", translation: "does anyone speak English?", example: "Polite way to ask in a crowd" },
        { target: "yaqin do'kon qayerda?", romanization: "yaqin do'kon qayerda", translation: "where's the nearest store?", example: "You'll use this a lot" },
      ],
    },
  ];

  const lessons = await LanguageLesson.insertMany(
    lessonDefs.map((l) => ({
      title: l.title,
      slug: slugify(`${l.language}-${l.title}`),
      language: l.language,
      category: l.category,
      level: l.level,
      order: l.order,
      description: l.description,
      vocabulary: l.vocab,
      quiz: l.vocab.slice(0, 4).map((v) => {
        const distractors = l.vocab.filter((x) => x !== v).map((x) => x.translation);
        const choices = [v.translation, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
        return {
          prompt: `What does "${v.target}" (${v.romanization}) mean?`,
          choices,
          correctIndex: choices.indexOf(v.translation),
        };
      }),
      xpReward: 15 + l.level * 5,
    })),
  );
  console.log(`[seed] language lessons: ${lessons.length}`);

  // ------------------------------------------------------------ ACHIEVEMENTS
  const achievements = await Achievement.insertMany([
    { key: "first-save", title: "First Save", description: "Save your first place to your account.", icon: "bookmark", xpReward: 20, criteria: "Save 1 place" },
    { key: "explorer-10-places", title: "Neighborhood Explorer", description: "Save 10 places across DONGNE.", icon: "compass", xpReward: 60, criteria: "Save 10 places" },
    { key: "first-post", title: "First Post", description: "Share your first community post.", icon: "message-circle", xpReward: 25, criteria: "Create 1 post" },
    { key: "reviewer-5-reviews", title: "Trusted Reviewer", description: "Leave 5 place reviews.", icon: "star", xpReward: 50, criteria: "Write 5 reviews" },
    { key: "collector-3-collections", title: "Collector", description: "Create 3 collections.", icon: "folder-heart", xpReward: 40, criteria: "Create 3 collections" },
    { key: "polyglot-5-lessons", title: "Rising Polyglot", description: "Complete 5 Korean language lessons.", icon: "graduation-cap", xpReward: 70, criteria: "Complete 5 lessons" },
    { key: "social-butterfly-10-follows", title: "Social Butterfly", description: "Follow 10 fellow explorers.", icon: "users", xpReward: 30, criteria: "Follow 10 users" },
    { key: "streak-7", title: "Week-Long Streak", description: "Stay active on DONGNE for 7 days in a row.", icon: "flame", xpReward: 80, criteria: "7-day activity streak" },
  ]);
  console.log(`[seed] achievements: ${achievements.length}`);

  // ---------------------------------------------------------------- USERS
  const passwordHash = await bcrypt.hash("password123", 10);
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  const admin = await User.create({
    username: "admin",
    email: "admin@gmail.com",
    passwordHash: adminPasswordHash,
    role: "admin",
    displayName: "DONGNE Admin",
    bio: "Platform administrator.",
    avatarUrl: img("avatar-admin", 200, 200),
    homeCity: cityBySlug.seoul._id,
    interests: ["culture", "shopping"],
  });

  const moderator = await User.create({
    username: "moderator",
    email: "moderator@dongne.app",
    passwordHash,
    role: "moderator",
    displayName: "Community Moderator",
    avatarUrl: img("avatar-mod", 200, 200),
    homeCity: cityBySlug.seoul._id,
    interests: ["nightlife"],
  });

  const demoUserDefs = [
    { username: "jinwoo_seoul", displayName: "Jinwoo", bio: "Seongsu café hopper. Always looking for the next roastery.", interests: ["cafe", "art"], home: "seoul" },
    { username: "haerin_explores", displayName: "Haerin", bio: "K-pop merch collector and Apgujeong regular.", interests: ["kpop", "shopping"], home: "seoul" },
    { username: "minsoo_busan", displayName: "Minsoo", bio: "Busan local. Beach mornings, BBQ nights.", interests: ["nature", "bbq"], home: "busan" },
  ];

  const demoUsers = [];
  for (const u of demoUserDefs) {
    const user = await User.create({
      username: u.username,
      email: `${u.username}@dongne.app`,
      passwordHash,
      displayName: u.displayName,
      bio: u.bio,
      avatarUrl: img(`avatar-${u.username}`, 200, 200),
      coverUrl: img(`cover-${u.username}`),
      interests: u.interests,
      homeCity: cityBySlug[u.home]._id,
      preferences: { categories: u.interests, priceLevel: [1, 2, 3, 4] },
    });
    demoUsers.push(user);
  }
  const [jinwoo, haerin, minsoo] = demoUsers;
  console.log(`[seed] users: admin, moderator, ${demoUsers.length} demo users`);

  // saved places
  jinwoo.savedPlaces = [placeByName["Onion Seongsu Café"]._id, placeByName["Fritz Coffee Company"]._id, placeByName["Seoul Forest Park"]._id];
  haerin.savedPlaces = [placeByName["SM Entertainment COEX Artium"]._id, placeByName["Idol Photocard Café"]._id];
  minsoo.savedPlaces = [placeByName["Haeundae Beach Boardwalk"]._id, placeByName["Gwangalli Night Beach Bars"]._id];
  for (const p of [placeByName["Onion Seongsu Café"], placeByName["Fritz Coffee Company"], placeByName["Seoul Forest Park"], placeByName["SM Entertainment COEX Artium"], placeByName["Idol Photocard Café"], placeByName["Haeundae Beach Boardwalk"], placeByName["Gwangalli Night Beach Bars"]]) {
    p.saveCount += 1;
    await p.save();
  }
  await Promise.all(demoUsers.map((u) => u.save()));

  // follows
  await Follow.create({ follower: jinwoo._id, following: haerin._id });
  await Follow.create({ follower: jinwoo._id, following: minsoo._id });
  await Follow.create({ follower: haerin._id, following: jinwoo._id });
  await User.findByIdAndUpdate(jinwoo._id, { followingCount: 2, followersCount: 1 });
  await User.findByIdAndUpdate(haerin._id, { followingCount: 1, followersCount: 1 });
  await User.findByIdAndUpdate(minsoo._id, { followersCount: 1 });

  // posts + comments + likes
  const post1 = await Post.create({
    author: jinwoo._id,
    text: "Found the best flat white in Seongsu at Onion — the industrial bakery vibe is unmatched. ☕",
    images: [img("post-onion-1")],
    place: placeByName["Onion Seongsu Café"]._id,
    neighborhood: nbhdBySlug.seongsu._id,
    likeCount: 2,
    commentCount: 1,
  });
  const post2 = await Post.create({
    author: haerin._id,
    text: "Pulled 3 rare photocards at the Apgujeong café today, still in shock 😭📸",
    images: [img("post-photocard-1")],
    place: placeByName["Idol Photocard Café"]._id,
    neighborhood: nbhdBySlug.apgujeong._id,
    likeCount: 1,
  });
  const post3 = await Post.create({
    author: minsoo._id,
    text: "Sunrise at Haeundae hits different when you live 10 minutes away.",
    images: [img("post-haeundae-1")],
    place: placeByName["Haeundae Beach Boardwalk"]._id,
    neighborhood: nbhdBySlug.haeundae._id,
    likeCount: 3,
  });

  await Comment.create({ post: post1._id, author: haerin._id, text: "adding this to my Seongsu list immediately" });
  await Post.findByIdAndUpdate(post1._id, { commentCount: 1 });

  await Like.create({ user: haerin._id, targetType: "Post", targetId: post1._id });
  await Like.create({ user: minsoo._id, targetType: "Post", targetId: post1._id });
  await Like.create({ user: jinwoo._id, targetType: "Post", targetId: post2._id });
  await Like.create({ user: jinwoo._id, targetType: "Post", targetId: post3._id });
  await Like.create({ user: haerin._id, targetType: "Post", targetId: post3._id });
  await Like.create({ user: admin._id, targetType: "Post", targetId: post3._id });

  // reviews
  await Review.create({ place: placeByName["Onion Seongsu Café"]._id, author: jinwoo._id, rating: 5, text: "Worth the queue. Get the pain au levain." });
  await Review.create({ place: placeByName["Fritz Coffee Company"]._id, author: jinwoo._id, rating: 5, text: "Best filter coffee in Seoul, hands down." });
  await Review.create({ place: placeByName["Haeundae Beach Boardwalk"]._id, author: minsoo._id, rating: 4, text: "Gets crowded in summer but the sunrise is unbeatable." });

  // collections
  await Collection.create({
    owner: jinwoo._id,
    name: "Seongsu Café Crawl",
    description: "Every café worth the trip in Seoul's design district.",
    isPublic: true,
    coverImage: img("collection-seongsu"),
    items: [
      { itemType: "Place", itemId: placeByName["Onion Seongsu Café"]._id, order: 0 },
      { itemType: "Place", itemId: placeByName["Fritz Coffee Company"]._id, order: 1 },
    ],
  });
  await Collection.create({
    owner: haerin._id,
    name: "K-pop Pilgrimage",
    description: "Agency buildings, photocard cafés, and idol hangouts.",
    isPublic: true,
    coverImage: img("collection-kpop"),
    items: [
      { itemType: "Place", itemId: placeByName["SM Entertainment COEX Artium"]._id, order: 0 },
      { itemType: "Place", itemId: placeByName["Idol Photocard Café"]._id, order: 1 },
    ],
  });
  await Collection.create({
    owner: minsoo._id,
    name: "Busan Beach Days",
    description: "My personal rotation for weekend beach hangs.",
    isPublic: false,
    items: [{ itemType: "Place", itemId: placeByName["Haeundae Beach Boardwalk"]._id, order: 0 }],
  });

  // language progress
  await LessonProgress.create({
    user: jinwoo._id,
    lesson: lessons[0]._id,
    status: "completed",
    bestScore: 100,
    attempts: 1,
    xpEarned: lessons[0].xpReward,
    completedAt: new Date(),
  });
  await LessonProgress.create({
    user: jinwoo._id,
    lesson: lessons[1]._id,
    status: "completed",
    bestScore: 75,
    attempts: 2,
    xpEarned: lessons[1].xpReward,
    completedAt: new Date(),
  });

  // xp / level / streak / achievements seed values
  await User.findByIdAndUpdate(jinwoo._id, {
    xp: 45,
    level: 2,
    streak: { count: 4, lastActiveDate: new Date().toISOString().slice(0, 10) },
    unlockedAchievements: [
      { key: "first-save", unlockedAt: new Date() },
      { key: "first-post", unlockedAt: new Date() },
    ],
  });
  await User.findByIdAndUpdate(haerin._id, {
    xp: 20,
    level: 1,
    unlockedAchievements: [{ key: "first-save", unlockedAt: new Date() }],
  });

  // activity log (for personalization + trending demo data)
  const activitySeed = [
    { user: jinwoo._id, type: "view", targetType: "Place", targetId: placeByName["Onion Seongsu Café"]._id },
    { user: jinwoo._id, type: "view", targetType: "Place", targetId: placeByName["LCDC Seoul"]._id },
    { user: jinwoo._id, type: "save", targetType: "Place", targetId: placeByName["Seoul Forest Park"]._id },
    { user: haerin._id, type: "view", targetType: "Place", targetId: placeByName["SM Entertainment COEX Artium"]._id },
    { user: haerin._id, type: "search", targetType: "Query", meta: { q: "photocard cafe" } },
    { user: minsoo._id, type: "view", targetType: "Place", targetId: placeByName["Spa Land Centum City"]._id },
    { user: minsoo._id, type: "rate", targetType: "Place", targetId: placeByName["Haeundae Beach Boardwalk"]._id, meta: { rating: 4 } },
  ];
  await UserActivity.insertMany(activitySeed);
  // extra trending signal — several users "viewing" the same handful of places recently
  const trendingBoost = [];
  for (const place of [placeByName["Onion Seongsu Café"], placeByName["Fritz Coffee Company"], placeByName["COEX Starfield Library"], placeByName["Seongsan Ilchulbong Sunrise Peak"]]) {
    for (const u of [jinwoo, haerin, minsoo, admin]) {
      trendingBoost.push({ user: u._id, type: "view", targetType: "Place", targetId: place._id });
    }
  }
  await UserActivity.insertMany(trendingBoost);

  // notifications
  await Notification.create({
    recipient: jinwoo._id,
    actor: haerin._id,
    type: "follow",
    message: "Haerin started following you",
  });
  await Notification.create({
    recipient: jinwoo._id,
    actor: haerin._id,
    type: "comment",
    message: "Haerin commented on your post",
    targetType: "Post",
    targetId: post1._id,
  });
  await Notification.create({
    recipient: haerin._id,
    type: "achievement",
    message: "Achievement unlocked: First Save",
  });

  console.log("[seed] demo social graph, activity, and notifications created");
  console.log("\n[seed] Done. Demo accounts (password: password123, admin: admin123):");
  console.log("  admin@gmail.com        (admin)");
  console.log("  moderator@dongne.app   (moderator)");
  console.log("  jinwoo_seoul@dongne.app / haerin_explores@dongne.app / minsoo_busan@dongne.app (user)");

  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
