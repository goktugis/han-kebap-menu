const path = require("path");
const fs = require("fs");
const assert = require("assert");
const { chromium } = require("playwright-core");
const { createServer } = require("../tools/serve");

const data = require("../menu-data.js");
const shots = path.join(__dirname, "screenshots");
fs.mkdirSync(shots, { recursive: true });

const CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
];
const exe = process.env.BROWSER || CANDIDATES.find((p) => fs.existsSync(p));

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log("  ✓", name); }
  catch (e) { failed++; console.error("  ✗", name, "\n   ", e.message.split("\n")[0]); }
}

const totalItems = data.categories.reduce((n, c) => n + c.items.length, 0);

async function suite(browser, label, ctxOpts) {
  console.log(`\n${label}`);
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => m.type() === "error" && !/fonts\.g/.test(m.text()) && errors.push("console: " + m.text()));
  page.on("requestfailed", (r) => !/fonts\.g/.test(r.url()) && errors.push("failed: " + r.url()));
  page.on("response", (r) => r.status() >= 400 && errors.push(r.status() + " " + r.url()));

  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForSelector(".item");
  const tag = label.split(" ")[0].toLowerCase();

  await test("başlık ve restoran adı görünüyor", async () => {
    assert.match(await page.title(), /Han Kebap/);
    assert.strictEqual((await page.textContent("#restName")).trim(), "Han Kebap");
  });

  await test("tüm kategoriler ve ürünler render edildi", async () => {
    assert.strictEqual(await page.locator(".section").count(), data.categories.length);
    assert.strictEqual(await page.locator(".cats__link").count(), data.categories.length);
    assert.strictEqual(await page.locator(".item").count(), totalItems);
  });

  await test("fiyatlar ₺ ile biçimlendirilmiş", async () => {
    const prices = await page.locator(".item .price").allTextContents();
    prices.forEach((p) => assert.match(p, /^\d{1,3}(\.\d{3})* ₺$/));
    assert.ok(prices.includes("2.400 ₺"));
  });

  await test("tüm görseller yüklendi", async () => {
    await page.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager")));
    await page.waitForFunction(() => [...document.querySelectorAll(".item__thumb")].every((i) => i.complete), null, { timeout: 8000 });
    const broken = await page.evaluate(() => [...document.querySelectorAll(".item__thumb")].filter((i) => !i.naturalWidth).map((i) => i.src));
    assert.deepStrictEqual(broken, []);
    const bgs = await page.evaluate(() => [...document.querySelectorAll(".section__banner")].map((b) => getComputedStyle(b).backgroundImage));
    bgs.forEach((b) => assert.match(b, /images\//));
  });

  await test("sayfa başında 'yukarı çık' butonu gizli", async () => {
    assert.ok(!(await page.isVisible("#toTop")));
  });

  await test("yatay taşma (horizontal scroll) yok", async () => {
    const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(o <= 0, "taşma: " + o + "px");
  });

  await page.screenshot({ path: path.join(shots, `${tag}-1-top.png`) });

  await test("kategori butonu ilgili bölüme kaydırır ve aktif olur", async () => {
    await page.click('.cats__link[data-cat="kebaplar"]');
    await page.waitForTimeout(1200);
    const top = await page.evaluate(() => document.getElementById("kebaplar").getBoundingClientRect().top);
    const barH = await page.evaluate(() => document.getElementById("topbar").offsetHeight);
    assert.ok(Math.abs(top - barH) < 20, `bölüm başlığı çubuğun altında değil (${top} vs ${barH})`);
    assert.strictEqual(await page.getAttribute('.cats__link[data-cat="kebaplar"]', "aria-current"), "true");
    assert.strictEqual(await page.locator('.cats__link[aria-current="true"]').count(), 1);
  });

  await page.screenshot({ path: path.join(shots, `${tag}-2-kebaplar.png`) });

  await test("kaydırdıkça aktif kategori güncelleniyor (scrollspy)", async () => {
    for (const id of ["tatlilar", "steaklar", "corbalar"]) {
      await page.evaluate((i) => {
        const bar = document.getElementById("topbar").offsetHeight;
        window.scrollTo({ top: document.getElementById(i).offsetTop - bar + 5, behavior: "instant" });
      }, id);
      await page.waitForTimeout(250);
      assert.strictEqual(await page.getAttribute(".cats__link[aria-current=true]", "data-cat"), id);
    }
  });

  await test("sayfa sonunda son kategori aktif, yukarı çık butonu görünür", async () => {
    await page.evaluate(() => window.scrollTo({ top: 1e6, behavior: "instant" }));
    await page.waitForTimeout(300);
    assert.strictEqual(await page.getAttribute(".cats__link[aria-current=true]", "data-cat"), "icecekler");
    assert.ok(await page.isVisible("#toTop"));
    await page.click("#toTop");
    await page.waitForFunction(() => window.scrollY < 5, null, { timeout: 5000 });
  });

  await test("arama: 'kebap' sonuç döner, diğer kategoriler gizlenir", async () => {
    await page.fill("#search", "kebap");
    const n = await page.locator(".item").count();
    assert.ok(n >= 3 && n < totalItems);
    const names = await page.locator(".item__name").allTextContents();
    assert.ok(names.includes("Adana Kebap"));
    assert.ok(await page.isVisible("#searchClear"));
  });

  await test("arama Türkçe karakter duyarsız ('cay' → Çay, 'kofte' yok, 'sutlac' → Sütlaç)", async () => {
    await page.fill("#search", "cay");
    assert.ok((await page.locator(".item__name").allTextContents()).includes("Çay"));
    await page.fill("#search", "sutlac");
    assert.deepStrictEqual(await page.locator(".item__name").allTextContents(), ["Fırın Sütlaç"]);
    await page.fill("#search", "SİĞARA");
    assert.deepStrictEqual(await page.locator(".item__name").allTextContents(), ["Sigara Böreği"]);
  });

  await test("sonuç yoksa mesaj gösterilir, temizleyince menü geri gelir", async () => {
    await page.fill("#search", "zzzzqq");
    assert.ok(await page.isVisible("#empty"));
    assert.strictEqual(await page.locator(".item").count(), 0);
    await page.click("#searchClear");
    assert.ok(!(await page.isVisible("#empty")));
    assert.strictEqual(await page.locator(".item").count(), totalItems);
    assert.strictEqual(await page.inputValue("#search"), "");
  });

  await test("filtre: Vejetaryen sadece vejetaryen ürünleri gösterir, tekrar tıklayınca kalkar", async () => {
    await page.click('.filter[data-tag="vegan"]');
    const expected = data.categories.flatMap((c) => c.items).filter((i) => (i.tags || []).includes("vegan")).length;
    assert.strictEqual(await page.locator(".item").count(), expected);
    assert.strictEqual(await page.locator(".item .badge--vegan").count(), expected);
    await page.click('.filter[data-tag="vegan"]');
    assert.strictEqual(await page.locator(".item").count(), totalItems);
  });

  await test("filtre + arama birlikte çalışır", async () => {
    await page.click('.filter[data-tag="sef"]');
    await page.fill("#search", "bonfile");
    const names = await page.locator(".item__name").allTextContents();
    assert.deepStrictEqual(names, ["Dana Bonfile"]);
    await page.fill("#search", "");
    await page.click('.filter[data-tag="sef"]');
    assert.strictEqual(await page.locator(".item").count(), totalItems);
  });

  await test("fotoğraflı ürüne tıklayınca detay penceresi açılır ve kapanır", async () => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.locator('[data-item="Tomahawk"]').scrollIntoViewIfNeeded();
    await page.click('[data-item="Tomahawk"]');
    await page.waitForSelector("#sheet[open]");
    assert.strictEqual((await page.textContent("#sheetName")).trim(), "Tomahawk");
    assert.strictEqual((await page.textContent("#sheetPrice")).trim(), "2.400 ₺");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(shots, `${tag}-3-detay.png`) });
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.getElementById("sheet").open);
  });

  await test("telefon bağlantısı tel: formatında", async () => {
    const href = await page.getAttribute("#footPhone", "href");
    assert.match(href, /^tel:\+?\d+$/);
  });

  await test("konsolda hata ve kırık istek yok", async () => {
    assert.deepStrictEqual(errors, []);
  });

  await page.evaluate(() => window.scrollTo({ top: 1e6, behavior: "instant" }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(shots, `${tag}-4-footer.png`) });
  await ctx.close();
}

let BASE;
(async () => {
  if (!exe) { console.error("Tarayıcı bulunamadı. BROWSER env ile yol ver."); process.exit(1); }
  const server = createServer();
  await new Promise((r) => server.listen(0, r));
  BASE = "http://localhost:" + server.address().port + "/";
  const browser = await chromium.launch({ executablePath: exe, headless: true });
  const iphone = { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  const small = { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  await suite(browser, "Mobil (375x812)", iphone);
  await suite(browser, "Küçük mobil (320x640)", small);
  await suite(browser, "Masaüstü (1280x800)", { viewport: { width: 1280, height: 800 } });
  await browser.close();
  server.close();
  console.log(`\nE2E: ${passed} geçti, ${failed} kaldı`);
  process.exit(failed ? 1 : 0);
})();
