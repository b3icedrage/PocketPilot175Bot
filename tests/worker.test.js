import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/worker.js", import.meta.url), "utf8");
const wrangler = await readFile(new URL("../wrangler.toml", import.meta.url), "utf8");

test("worker keeps real-money execution locked", () => {
  assert.match(source, /Real-money mode is locked/);
  assert.match(source, /No live orders or unofficial broker execution are supported/);
});

test("AUD/CAD OTC stays pending until a verified feed exists", () => {
  assert.match(source, /AUD\/CAD OTC/);
  assert.match(source, /PENDING_FEED_VERIFICATION/);
  assert.match(source, /No verified OTC quote source configured/);
});

test("worker checks Telegram webhook secret", () => {
  assert.match(source, /X-Telegram-Bot-Api-Secret-Token/);
  assert.match(source, /env\.WEBHOOK_SECRET/);
});

test("Cloudflare config binds the existing D1 database", () => {
  assert.match(wrangler, /binding = "DB"/);
  assert.match(wrangler, /a27da7f3-c328-4266-a3c7-1ee9d2ac7cf0/);
});
