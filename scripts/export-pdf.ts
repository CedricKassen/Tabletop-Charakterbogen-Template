/**
 * Headless PDF export.
 *
 *   pnpm export                  # all sheets
 *   pnpm export pandoria         # selected sheets
 *
 * Builds the project, serves it with `vite preview`, prints each sheet with
 * Chromium and writes `out/<sheet>.pdf`. Page size comes from the sheet's CSS
 * (`@page`), so every `<Page>` becomes exactly one PDF page.
 *
 * Browser: CHROME_PATH if set, else Playwright's Chromium
 * (`pnpm exec playwright install chromium`), else an installed Google Chrome.
 */
import { mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { build, preview } from "vite";
import { chromium } from "playwright";

const root = new URL("..", import.meta.url).pathname;
const sheetsDir = `${root}src/sheets`;

const all = (await readdir(sheetsDir, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && existsSync(`${sheetsDir}/${d.name}/index.tsx`))
  .map((d) => d.name);
const wanted = process.argv.slice(2);
const unknown = wanted.filter((id) => !all.includes(id));
if (unknown.length) {
  console.error(`Unknown sheet(s): ${unknown.join(", ")}. Available: ${all.join(", ")}`);
  process.exit(1);
}
const ids = wanted.length ? wanted : all;

await build({ root, logLevel: "warn" });
const server = await preview({ root, preview: { port: 0, open: false } });
const baseUrl = server.resolvedUrls!.local[0];

const browser = process.env.CHROME_PATH
  ? await chromium.launch({ executablePath: process.env.CHROME_PATH })
  : await chromium.launch().catch(() => chromium.launch({ channel: "chrome" }));
try {
  await mkdir(`${root}out`, { recursive: true });
  for (const id of ids) {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${baseUrl}?sheet=${encodeURIComponent(id)}`);
    await page
      .waitForSelector("body[data-ready]", { state: "attached", timeout: 30_000 })
      .catch(() => {
        throw new Error(`Sheet "${id}" did not render.\n${errors.join("\n")}`);
      });
    const file = `${root}out/${id}.pdf`;
    await page.pdf({ path: file, preferCSSPageSize: true, printBackground: true });
    console.log(`✓ ${file}`);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
