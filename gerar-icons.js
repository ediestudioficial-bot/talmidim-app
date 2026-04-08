const sharp = require("sharp");
const path = require("path");

const logoPath = path.join(__dirname, "assets", "logo.png");
const out192 = path.join(__dirname, "assets", "icon-192.png");
const out512 = path.join(__dirname, "assets", "icon-512.png");

async function main() {
  await sharp(logoPath)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out192);

  await sharp(logoPath)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out512);

  console.log("Gerados:", out192, out512);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
