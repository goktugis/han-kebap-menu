/**
 * QR kod üretici.
 * Kullanım:  npm run qr -- https://menu.hankebap.com
 * (URL verilmezse config.json içindeki "menuUrl" kullanılır.)
 * Çıktılar: qr/han-kebap-qr.png, qr/han-kebap-qr.svg, qr/qr-kart.html (yazdırılabilir masa kartı)
 */
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const root = path.join(__dirname, "..");
const cfgPath = path.join(root, "config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));

const arg = process.argv[2];
const url = arg || cfg.menuUrl;

try {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error("http/https olmalı");
} catch (e) {
  console.error("Geçersiz URL:", url, "-", e.message);
  process.exit(1);
}

if (arg && arg !== cfg.menuUrl) {
  cfg.menuUrl = arg;
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + "\n");
}

const outDir = path.join(root, "qr");
fs.mkdirSync(outDir, { recursive: true });

const opts = {
  errorCorrectionLevel: "H",
  margin: 2,
  color: { dark: "#14110f", light: "#ffffff" },
};

(async () => {
  await QRCode.toFile(path.join(outDir, "han-kebap-qr.png"), url, { ...opts, width: 1200 });
  const svg = await QRCode.toString(url, { ...opts, type: "svg" });
  fs.writeFileSync(path.join(outDir, "han-kebap-qr.svg"), svg);

  const card = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"><title>Han Kebap - QR Masa Kartı</title>
<style>
  @page { size: A5 portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; }
  body { background: #ddd; font-family: Georgia, "Times New Roman", serif; }
  .card { width: 148mm; height: 210mm; margin: 0 auto; background: #14110f; color: #f3ece0;
    display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 14mm; }
  .eyebrow { color: #c9a24d; letter-spacing: .35em; font-size: 11pt; text-transform: uppercase; }
  h1 { font-size: 40pt; letter-spacing: .06em; text-transform: uppercase; margin: 6mm 0 2mm; }
  .sub { color: #c9a24d; letter-spacing: .6em; font-size: 12pt; text-transform: uppercase; padding-left: .6em; }
  .line { width: 18mm; height: 1px; background: #c9a24d; margin: 9mm 0; }
  .qr { background: #fff; padding: 6mm; border-radius: 6mm; }
  .qr svg { width: 62mm; height: 62mm; display: block; }
  .cta { margin-top: 9mm; font-size: 15pt; font-style: italic; }
  .hint { margin-top: 3mm; font-family: Arial, sans-serif; font-size: 9pt; color: #a89f93; }
  @media print { body { background: none; } .card { margin: 0; } }
</style></head>
<body><div class="card">
  <div class="eyebrow">Dijital Menü</div>
  <h1>Han Kebap</h1><div class="sub">Steakhouse</div>
  <div class="line"></div>
  <div class="qr">${svg.replace(/<\?xml[^>]*\?>/, "")}</div>
  <div class="cta">Menü için kameranızı okutun</div>
  <div class="hint">${url}</div>
</div></body></html>
`;
  fs.writeFileSync(path.join(outDir, "qr-kart.html"), card);
  console.log("QR üretildi ->", url);
  console.log("  qr/han-kebap-qr.png\n  qr/han-kebap-qr.svg\n  qr/qr-kart.html");
})();
