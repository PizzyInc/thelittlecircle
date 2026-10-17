// Packages dist/ into a ZIP for the /download page
// Run: node zip-dist.js  (or npm run package)
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const distDir = path.resolve(__dirname, "dist");
const outDir = path.resolve(__dirname, "..", "web", "public");
const outFile = path.join(outDir, "the-little-circle-extension.zip");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const ps1 = path.join(require("os").tmpdir(), "tlc-zip.ps1");
fs.writeFileSync(
  ps1,
  [
    `Add-Type -Assembly System.IO.Compression.FileSystem`,
    `if (Test-Path '${outFile}') { Remove-Item '${outFile}' }`,
    `[System.IO.Compression.ZipFile]::CreateFromDirectory('${distDir}', '${outFile}')`,
  ].join("\n")
);

execFileSync("powershell", ["-ExecutionPolicy", "Bypass", "-File", ps1]);
fs.unlinkSync(ps1);

const size = (fs.statSync(outFile).size / 1024).toFixed(1);
console.log(`✓ Packaged ${size} KB → ${path.relative(process.cwd(), outFile)}`);
