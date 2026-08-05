/**
 * Lightweight FE smoke: critical App Router surfaces exist and export defaults.
 * Run: node scripts/smoke.mjs
 */
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const routes = [
  "app/(marketing)/page.tsx",
  "app/(marketing)/features/page.tsx",
  "app/(marketing)/pricing/page.tsx",
  "app/(marketing)/about/page.tsx",
  "app/(auth)/login/page.tsx",
  "app/(auth)/signup/page.tsx",
  "app/(user)/dashboard/page.tsx",
  "app/(user)/upload/page.tsx",
  "app/(user)/documents/page.tsx",
  "app/(user)/notifications/page.tsx",
  "app/(admin)/admin/page.tsx",
  "app/(admin)/admin/pending/page.tsx",
  "app/api/auth/login/route.ts",
  "app/api/auth/refresh/route.ts",
];

const requiredSnippets = [
  ["lib/api/types.ts", "export interface Paginated"],
  ["lib/api/client.ts", "baseURL"],
  ["lib/auth/session.tsx", "useAuth"],
];

let failed = false;

for (const rel of routes) {
  const full = path.join(root, rel);
  try {
    await access(full);
    const src = await readFile(full, "utf8");
    if (!/export default/.test(src) && !/export async function (GET|POST)/.test(src)) {
      console.error(`FAIL: ${rel} missing default/route export`);
      failed = true;
    } else {
      console.log(`ok  ${rel}`);
    }
  } catch {
    console.error(`FAIL: missing ${rel}`);
    failed = true;
  }
}

for (const [rel, needle] of requiredSnippets) {
  const full = path.join(root, rel);
  try {
    const src = await readFile(full, "utf8");
    if (!src.includes(needle)) {
      console.error(`FAIL: ${rel} missing "${needle}"`);
      failed = true;
    } else {
      console.log(`ok  ${rel} (${needle})`);
    }
  } catch {
    console.error(`FAIL: missing ${rel}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log("FE smoke passed");
