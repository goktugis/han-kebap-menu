const fs = require("fs");
const path = require("path");
const assert = require("assert");
const sharp = require("sharp");
const jsQR = require("jsqr");

const root = path.join(__dirname, "..");
const data = require(path.join(root, "menu-data.js"));
const cfg = require(path.join(root, "config.json"));

let passed = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { passed++; console.log("  ✓", name); },
    (e) => { console.error("  ✗", name, "\n   ", e.message); process.exitCode = 1; }
  );
}

(async () => {
  console.log("Veri testleri");
  const VALID_TAGS = ["sef", "aci", "vegan", "yeni"];

  await test("restoran bilgileri dolu", () => {
    ["name", "subtitle", "tagline", "hours", "address", "phone", "note"].forEach((k) =>
      assert.ok(data.restaurant[k], "eksik: " + k));
  });

  await test("en az 8 kategori var, id'ler benzersiz ve URL-güvenli", () => {
    assert.ok(data.categories.length >= 8);
    const ids = data.categories.map((c) => c.id);
    assert.strictEqual(new Set(ids).size, ids.length);
    ids.forEach((id) => assert.match(id, /^[a-z0-9-]+$/));
  });

  await test("her kategoride ürün var, ürünler geçerli", () => {
    data.categories.forEach((c) => {
      assert.ok(c.name && c.items.length > 0, c.id);
      const names = new Set();
      c.items.forEach((i) => {
        assert.ok(i.name, c.id + ": isimsiz ürün");
        assert.ok(!names.has(i.name), c.id + ": tekrar eden ürün " + i.name);
        names.add(i.name);
        assert.ok(Number.isFinite(i.price) && i.price > 0, i.name + ": fiyat geçersiz");
        (i.tags || []).forEach((t) => assert.ok(VALID_TAGS.includes(t), i.name + ": bilinmeyen etiket " + t));
      });
    });
  });

  await test("referans verilen tüm görseller diskte var", () => {
    const used = new Set();
    data.categories.forEach((c) => {
      if (c.img) used.add(c.img);
      c.items.forEach((i) => i.img && used.add(i.img));
    });
    used.add("hero.jpg");
    used.forEach((f) => {
      const p = path.join(root, "images", f);
      assert.ok(fs.existsSync(p), "görsel yok: " + f);
      assert.ok(fs.statSync(p).size > 5000, "görsel bozuk/küçük: " + f);
    });
  });

  await test("görseller mobil için yeterince hafif (<250KB)", () => {
    fs.readdirSync(path.join(root, "images")).forEach((f) =>
      assert.ok(fs.statSync(path.join(root, "images", f)).size < 250 * 1024, f));
  });

  await test("QR kod PNG'si okunuyor ve config'teki URL'yi içeriyor", async () => {
    const png = path.join(root, "qr", "han-kebap-qr.png");
    assert.ok(fs.existsSync(png), "qr yok; önce 'npm run qr' çalıştır");
    const { data: px, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const res = jsQR(new Uint8ClampedArray(px), info.width, info.height);
    assert.ok(res, "QR çözülemedi");
    assert.strictEqual(res.data, cfg.menuUrl);
  });

  console.log(`\n${passed} veri testi geçti`);
})();
