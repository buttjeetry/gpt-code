const MAX_H1_LENGTH = 65;

const optimizeBtn = document.getElementById("optimizeBtn");
const demoBtn = document.getElementById("demoBtn");
const copyBtn = document.getElementById("copyBtn");
const bulkInput = document.getElementById("bulkInput");
const resultSection = document.getElementById("resultSection");
const resultBody = document.getElementById("resultBody");

let latestRows = [];

const stopWords = new Set([
  "a",
  "an",
  "the",
  "of",
  "for",
  "to",
  "in",
  "on",
  "with",
  "and",
  "or",
  "at",
  "by",
  "from"
]);

const styleStarters = [
  "Best",
  "Top",
  "Affordable",
  "Trusted",
  "Compare",
  "Explore"
];

const styleEndings = ["Guide", "Options", "Deals", "Plans", "Today", "2026"];

optimizeBtn.addEventListener("click", () => {
  const rows = parseRows(bulkInput.value);
  if (!rows.length) {
    alert("Please paste at least one valid row with URL and H1.");
    return;
  }

  latestRows = rows.map((row, index) => {
    const optimized = optimizeH1(row.h1, index);
    return {
      ...row,
      originalLength: row.h1.length,
      optimized,
      optimizedLength: optimized.length,
      status: optimized.length <= MAX_H1_LENGTH ? "OK" : "Needs review"
    };
  });

  renderResults(latestRows);
  copyBtn.disabled = false;
  resultSection.classList.remove("hidden");
});

demoBtn.addEventListener("click", () => {
  bulkInput.value = [
    "URL\tH1",
    "https://site.com/seo-pricing\tSEO services pricing for small business in 2026 with monthly plans and affordable packages",
    "https://site.com/dental-plans\tBest dental implant treatment pricing packages for families and senior citizens",
    "https://site.com/ppc\tPPC management agency pricing and cost breakdown for ecommerce brands"
  ].join("\n");
});

copyBtn.addEventListener("click", async () => {
  const lines = ["URL\tOriginal H1\tOptimized H1\tOriginal Length\tNew Length\tStatus"];
  latestRows.forEach((row) => {
    lines.push(
      [row.url, row.h1, row.optimized, row.originalLength, row.optimizedLength, row.status]
        .map((cell) => String(cell).replace(/\t/g, " "))
        .join("\t")
    );
  });

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy Output TSV";
    }, 1200);
  } catch {
    alert("Could not copy automatically. Please copy from the table output.");
  }
});

function parseRows(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("\t"))
    .filter((cols) => cols.length >= 2)
    .map((cols) => {
      const url = cols[0].trim();
      const h1 = cols.slice(1).join(" ").trim();
      return { url, h1 };
    })
    .filter((row) => row.h1 && !/^h1$/i.test(row.h1) && !/^url$/i.test(row.url));
}

function optimizeH1(originalH1, index) {
  const normalized = originalH1.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_H1_LENGTH) {
    return normalized;
  }

  const keyword = extractMainKeyword(normalized);
  const pricing = extractPricingPhrase(normalized);
  const variant = buildVariant(keyword, pricing, index);

  if (variant.length <= MAX_H1_LENGTH) {
    return variant;
  }

  const compact = `${keyword}${pricing ? ` ${pricing}` : ""}`.trim();
  if (compact.length <= MAX_H1_LENGTH) {
    return compact;
  }

  return compact.slice(0, MAX_H1_LENGTH).trim();
}

function extractMainKeyword(text) {
  const leadPart = text.split(/[-|:]/)[0] || text;
  const words = leadPart
    .split(/\s+/)
    .map((word) => word.replace(/[^\w%$₹€£.-]/g, ""))
    .filter(Boolean);

  const cleaned = words.filter((word) => !stopWords.has(word.toLowerCase()));
  const baseWords = (cleaned.length ? cleaned : words).slice(0, 5);
  return toTitleCase(baseWords.join(" "));
}

function extractPricingPhrase(text) {
  const symbolMatch = text.match(/([$₹€£]\s?\d+[\d,]*(?:\.\d+)?(?:\s?(?:\/|per)\s?\w+)*)/i);
  if (symbolMatch) {
    return symbolMatch[1].replace(/\s+/g, " ").trim();
  }

  const pricingChunk = text.match(/\b(pricing|price|cost|plans?|packages?|rates?)\b[^,.|;]*/i);
  if (pricingChunk) {
    return pricingChunk[0].replace(/\s+/g, " ").trim();
  }

  return "";
}

function buildVariant(keyword, pricing, index) {
  const starter = styleStarters[index % styleStarters.length];
  const ending = styleEndings[index % styleEndings.length];

  const patterns = [
    `${starter} ${keyword} ${pricing}`,
    `${keyword}: ${pricing}`,
    `${starter} ${keyword} ${ending}`,
    `${keyword} ${ending}`
  ];

  for (const pattern of patterns) {
    const candidate = pattern.replace(/\s+/g, " ").replace(/\s+:/g, ":").trim();
    if (candidate.length <= MAX_H1_LENGTH) {
      return candidate;
    }
  }

  return patterns[0].replace(/\s+/g, " ").trim();
}

function toTitleCase(value) {
  return value
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function renderResults(rows) {
  resultBody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(row.url)}</td>
      <td>${escapeHtml(row.h1)}</td>
      <td>${row.originalLength}</td>
      <td><strong>${escapeHtml(row.optimized)}</strong></td>
      <td>${row.optimizedLength}</td>
      <td><span class="status ${row.status === "OK" ? "ok" : "warn"}">${row.status}</span></td>
    `;
    resultBody.appendChild(tr);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
