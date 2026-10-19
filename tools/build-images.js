/**
 * Menüde kullanılan hazır (stok) fotoğrafları indirir ve optimize eder.
 * Kaynaklar: Unsplash (ücretsiz lisans) ve Wikimedia Commons (Public Domain / CC0).
 * Çalıştır:  npm run images
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "images");
fs.mkdirSync(OUT, { recursive: true });

const U = (id) => `https://images.unsplash.com/${id}?w=1400&q=80&auto=format&fit=crop`;
const C = (file) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1400`;

// [çıktı adı, kaynak url, genişlik, yükseklik]
const IMAGES = [
  ["hero", U("photo-1546964124-0cce460f38ef"), 1400, 900],
  ["baslangiclar", U("photo-1637949385162-e416fb15b2ce"), 800, 600],
  ["corbalar", U("photo-1547592166-23ac45744acd"), 800, 600],
  ["salatalar", U("photo-1540189549336-e6e99c3679fe"), 800, 600],
  ["steaklar", U("photo-1600891964092-4316c288032e"), 800, 600],
  ["kebaplar", U("photo-1599487488170-d11ec9c172f0"), 800, 600],
  ["yan-lezzetler", U("photo-1541592106381-b31e9677c0e5"), 800, 600],
  ["soslar", U("photo-1555939594-58d7cb561ad1"), 800, 600],
  ["tatlilar", C("20250206 Künefe in Tarsus.jpg"), 800, 600],
  ["icecekler", U("photo-1556679343-c7306c1976bc"), 800, 600],
  ["bonfile", U("photo-1588168333986-5078d3ae3976"), 600, 600],
  ["ribeye", U("photo-1546964124-0cce460f38ef"), 600, 600],
  ["antrikot", U("photo-1594041680534-e8c8cdebd659"), 600, 600],
  ["tbone", U("photo-1551028150-64b9f398f678"), 600, 600],
  ["tomahawk", U("photo-1558030006-450675393462"), 600, 600],
  ["kusbasi", U("photo-1603360946369-dc9bb6258143"), 600, 600],
  ["adana", C("Adana kebab.jpg"), 600, 600],
  ["baklava", C("Baklava - Turkish special, 80-ply.JPEG"), 600, 600],
  ["limonata", U("photo-1621263764928-df1444c5e859"), 600, 600],
  ["cay", U("photo-1576092768241-dec231879fc3"), 600, 600],
];

(async () => {
  let failed = 0;
  for (const [name, url, w, h] of IMAGES) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "HanKebapMenu/1.0" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      await sharp(buf)
        .resize(w, h, { fit: "cover", position: "attention" })
        .jpeg({ quality: 78, progressive: true, mozjpeg: true })
        .toFile(path.join(OUT, name + ".jpg"));
      console.log("OK  ", name);
    } catch (e) {
      failed++;
      console.error("FAIL", name, e.message);
    }
  }
  process.exit(failed ? 1 : 0);
})();
