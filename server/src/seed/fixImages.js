// Replaces random placeholder photos with matching Unsplash photos.
// Safe to run on every start: it only sets images for known names.
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { Food } from "../models/Food.js";
import { Place } from "../models/Place.js";
import { Post } from "../models/Post.js";

const u = (id, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

// Food: matched by the start of the English name
const FOOD = {
  "Samgyeopsal": "1677029969065-c9f4003a9ad5",
  "Tteokbokki": "1747228469541-f0e7f56e7ec7",
  "Kimchi Jjigae": "1760228865341-675704c22a5b",
  "Bibimbap": "1741295017668-c8132acd6fc0",
  "Naengmyeon": "1616627052149-22c4f8a6316e",
  "Jjajangmyeon": "1626803774007-f92c2c32cbe7",
  "Sundubu": "1607502493639-ea518c5ac080",
  "Bungeoppang": "1624176193860-dd7866e5a8aa",
  "Samgyetang": "1562749606-0a9eb5a8a0f3",
  "Bingsu": "1771209802058-3b40ce534905",
  "Hotteok": "1616627077891-a4780e730b7e",
  "Gopchang": "1632558610168-8377309e34c7",
  "Tteokguk": "1618351708186-5ba8a9da1933",
  "Dakgalbi": "1707056503922-91c9ebaf0774",
  "Ramyeon": "1612927601601-6638404737ce",
  "Samgak": "1563998957248-b59e18407396",
  "Iced Americano": "1527156231393-7023794f363c",
  "Yakgwa": "1700152853602-adbe6c2f4d01",
  "Hoe": "1743653258526-84f0245660c5",
  "Heuk-dwaeji": "1780082755456-3a72460270ea",
};

// Places: matched by exact name
const PLACE = {
  "Club Ellui Underground": "1764510377343-e5b12385791b",
  "Thanks Nature Café": "1727303536729-e31158a64769",
  "Hongdae Free Market": "1628532431030-3b6d433ed166",
  "Vinyl & Vice Record Bar": "1601148071764-8c3f50e9ab20",
  "Style Nanda Pink Pool Café": "1768464706123-8eb92de776af",
  "COEX Starfield Library": "1742743920246-dfa5cce0982e",
  "Le Chamber Speakeasy": "1739799120521-c5f44a9335a3",
  "Apgujeong Rodeo Flagship Row": "1580250729659-e5cb6c5c110d",
  "Banpo Rainbow Bridge Fountain": "1609766818454-929f534a0a31",
  "Gangnam Jjimjilbang Spa": "1772616748530-7cd73053f326",
  "Gyeongnidan Rooftop Taco Bar": "1637070906584-d791e62c21b8",
  "Itaewon Antique Furniture Row": "1781176987353-aa5bd0e9a70f",
  "Prost Craft Beer Garden": "1766589220696-4c7d1654d476",
  "World Food Alley": "1695249747530-57460a88ad80",
  "Onion Seongsu Café": "1770739538932-433941c1267e",
  "Seoul Forest Park": "1616156567642-ac6444f971bb",
  "Daelim Warehouse Concept Store": "1759050486852-fdfe2fdc7bea",
  "LCDC Seoul": "1652618959145-1d58531713d4",
  "Common Ground Container Mall": "1788145748996-21be73cf60fc",
  "Myeongdong Street Food Alley": "1677097610167-c2d62b06fad3",
  "Nature Republic Flagship": "1596462502278-27bfdc403348",
  "Myeongdong Cathedral": "1645451305076-6af08b863a91",
  "Leeum Museum of Art": "1605758812572-9d16f424ae69",
  "Hannam-dong Han River Terrace": "1768006274228-caf48a5d5db4",
  "Studio Concrete Gallery Café": "1657033190047-fee4a6fd0789",
  "SM Entertainment COEX Artium": "1717029319572-5399c4ecc2dc",
  "Rodeo Street Flagship Boutiques": "1441984904996-e0b6ba687e04",
  "Idol Photocard Café": "1794483856189-119320b0b9f1",
  "Gyeongui Line Book Street": "1728129511889-cbe4823557e0",
  "Fritz Coffee Company": "1607681034540-2c46cc71896d",
  "Yeonnam-dong 3-Chome": "1746234970650-4c31c74536e6",
  "Haeundae Beach Boardwalk": "1700277842839-2ef54f815f47",
  "Spa Land Centum City": "1600334089648-b0d9d3028eb2",
  "Dongbaek Island Coastal Trail": "1772869603278-2e8e01060843",
  "Gwangalli Night Beach Bars": "1672671224291-4612e50bc438",
  "Dongmun Traditional Market": "1683669639055-83621f1bc1ff",
  "Seongsan Ilchulbong Sunrise Peak": "1562680802-9cf8b15f419d",
  "Haenyeo Diving Performance": "1779279236216-bcc97a5bd0fa",
};

// Community posts: matched by text
const POST = [
  [/flat white in Seongsu/i, "1551887196-72e32bfc7bf3"],
  [/rare photocards/i, "1649319045873-a3f471cdce1a"],
  [/Sunrise at Haeundae/i, "1647767444107-8f383924382d"],
];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function run() {
  await connectDatabase();
  let n = 0;
  for (const [name, id] of Object.entries(FOOD)) {
    const r = await Food.updateMany({ nameEnglish: new RegExp("^" + escape(name)) }, { $set: { images: [u(id)] } });
    n += r.modifiedCount;
  }
  for (const [name, id] of Object.entries(PLACE)) {
    const r = await Place.updateMany({ name }, { $set: { images: [u(id)] } });
    n += r.modifiedCount;
  }
  for (const [re, id] of POST) {
    const r = await Post.updateMany({ text: re }, { $set: { images: [u(id, 1200, 900)] } });
    n += r.modifiedCount;
  }
  console.log(`[fixImages] updated ${n} documents`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("[fixImages] skipped:", err.message);
  process.exit(0);
});
