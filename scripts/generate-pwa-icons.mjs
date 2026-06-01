/**
 * Generates PWA icons from the LUO logo SVG (brand colors, no UI changes).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#121212"/>
  <path d="M128 384 L256 96 L384 384 Z" stroke="#ffffff" stroke-width="28" fill="none" stroke-linejoin="round"/>
  <circle cx="256" cy="320" r="44" fill="#efff00"/>
</svg>`;

writeFileSync(join(publicDir, "icon.svg"), svg.trim());
console.log("Wrote public/icon.svg — add PNGs with an image tool, or use Capacitor assets.");
