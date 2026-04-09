const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = process.cwd();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".glb": "model/gltf-binary",
  ".woff2": "font/woff2",
};

function safeResolve(urlPath) {
  const raw = (urlPath || "/").split("?")[0].split("#")[0];
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const rel = decoded === "/" || decoded === "" ? "index.html" : decoded.replace(/^\//, "");
  const abs = path.normalize(path.join(ROOT, rel));
  const relative = path.relative(ROOT, abs);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
  return abs;
}

const server = http.createServer((req, res) => {
  const abs = safeResolve(req.url || "/");
  if (!abs) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(abs, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found: " + path.relative(ROOT, abs));
      return;
    }
    const ext = path.extname(abs).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      "Porta " + PORT + " em uso. Feche o outro processo ou rode: set PORT=3001 && node server.js"
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log("Servidor rodando em http://localhost:" + PORT);
  console.log("  Mapa:    http://localhost:" + PORT + "/");
  console.log("  Radar:   http://localhost:" + PORT + "/pages/radar.html");
});
