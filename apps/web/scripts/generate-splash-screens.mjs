import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = (name) => join(__dirname, "../public", name);

// [width, height, slug]
const SIZES = [
  [640,   1136, "iphone-se"],
  [750,   1334, "iphone-8"],
  [1242,  2208, "iphone-8-plus"],
  [1125,  2436, "iphone-x"],
  [828,   1792, "iphone-xr"],
  [1242,  2688, "iphone-xs-max"],
  [1080,  2340, "iphone-12-mini"],
  [1170,  2532, "iphone-12"],
  [1284,  2778, "iphone-12-pro-max"],
  [1179,  2556, "iphone-14-pro"],
  [1290,  2796, "iphone-14-pro-max"],
  [1536,  2048, "ipad"],
  [1668,  2224, "ipad-pro-10"],
  [1668,  2388, "ipad-pro-11"],
  [2048,  2732, "ipad-pro-12"],
];

function makeSplashSvg(w, h) {
  const logoR = Math.round(Math.min(w, h) * 0.20);
  const cx = w / 2;
  const cy = h / 2;
  const scale = (logoR * 2) / 512;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="splash-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff8f5"/>
      <stop offset="100%" stop-color="#ffe8dc"/>
    </linearGradient>
    <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe8dc"/>
      <stop offset="100%" stop-color="#ffd4c4"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#splash-bg)"/>
  <g transform="translate(${cx - logoR} ${cy - logoR}) scale(${scale})">
    <circle cx="256" cy="256" r="256" fill="url(#logo-bg)"/>
    <circle cx="186" cy="248" r="54" fill="white"/>
    <circle cx="186" cy="248" r="34" fill="#2c2c2c"/>
    <circle cx="175" cy="237" r="13" fill="rgba(255,255,255,0.85)"/>
    <circle cx="326" cy="248" r="54" fill="white"/>
    <circle cx="326" cy="248" r="34" fill="#2c2c2c"/>
    <circle cx="315" cy="237" r="13" fill="rgba(255,255,255,0.85)"/>
  </g>
</svg>`;
}

for (const [w, h, slug] of SIZES) {
  const svg = Buffer.from(makeSplashSvg(w, h));
  await sharp(svg, { density: 72 }).resize(w, h).png().toFile(out(`splash-${slug}.png`));
  console.log(`✓ splash-${slug}.png  (${w}×${h})`);
}
