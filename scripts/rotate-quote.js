const fs = require("fs");
const path = require("path");

const readmePath = path.join(__dirname, "..", "README.md");
const quotesPath = path.join(__dirname, "..", "data", "quotes.json");

const readme = fs.readFileSync(readmePath, "utf8");
const quotes = JSON.parse(fs.readFileSync(quotesPath, "utf8"));

if (!Array.isArray(quotes) || quotes.length === 0) {
  console.error("quotes.json está vazio ou inválido.");
  process.exit(1);
}

const dayNumber = Math.floor(Date.now() / 86400000);
const index = dayNumber % quotes.length;
const quote = quotes[index];

const quoteLine = `> "${quote}"`;
const listLines = quotes.map((q) => `  - "${q}"`).join("\n");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceSection(content, startMarker, endMarker, replacement) {
  const start = escapeRegExp(startMarker);
  const end = escapeRegExp(endMarker);
  const regex = new RegExp(`${start}[\\s\\S]*?${end}`);

  if (!regex.test(content)) {
    console.error(`Marcadores não encontrados: ${startMarker} ... ${endMarker}`);
    process.exit(1);
  }

  return content.replace(
    regex,
    `${startMarker}\n${replacement}\n${endMarker}`
  );
}

let updated = readme;
updated = replaceSection(
  updated,
  "<!-- QUOTE-START -->",
  "<!-- QUOTE-END -->",
  quoteLine
);
updated = replaceSection(
  updated,
  "<!-- QUOTES-LIST-START -->",
  "<!-- QUOTES-LIST-END -->",
  listLines
);

if (updated !== readme) {
  fs.writeFileSync(readmePath, updated, "utf8");
  console.log(`Frase atualizada: ${quote}`);
} else {
  console.log("Nenhuma mudança necessária.");
}
