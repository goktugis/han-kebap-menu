/** Yerel test/önizleme sunucusu:  npm run serve  (varsayılan port 5173) */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
};

function createServer() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT) || /node_modules|[\\/]tools[\\/]|[\\/]tests[\\/]/.test(file)) {
      res.writeHead(403); return res.end("Forbidden");
    }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end("Not found"); }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      res.end(buf);
    });
  });
}

module.exports = { createServer };

if (require.main === module) {
  const port = process.env.PORT || 5173;
  createServer().listen(port, "0.0.0.0", () => console.log("http://localhost:" + port));
}
