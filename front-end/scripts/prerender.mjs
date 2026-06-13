import puppeteer from "puppeteer";
import handler from "serve-handler";
import { createServer } from "node:http";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");
const PORT = 3999;
const ROUTES = ["/", "/login", "/register", "/search"];

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) =>
      handler(req, res, {
        public: DIST_DIR,
        rewrites: [{ source: "**", destination: "/index.html" }],
      }),
    );
    server.listen(PORT, () => resolve(server));
  });
}

async function prerender() {
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: "networkidle0",
        timeout: 15000,
      });
      await new Promise((r) => setTimeout(r, 1500));

      const html = await page.content();
      const outDir =
        route === "/"
          ? DIST_DIR
          : path.join(DIST_DIR, ...route.split("/").filter(Boolean));

      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      writeFileSync(path.join(outDir, "index.html"), html, "utf-8");
      console.log(`✅ ${route}`);
    } catch (e) {
      console.error(`❌ ${route}:`, e.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
}

prerender().catch(console.error);
