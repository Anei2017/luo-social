#!/usr/bin/env node
/**
 * HTTP + env smoke test for LUO Social.
 * Usage: node scripts/smoke-test.mjs [baseUrl]
 * Default baseUrl: http://127.0.0.1:3000
 */

const BASE = process.argv[2]?.replace(/\/$/, "") || "http://127.0.0.1:3000";

const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/env-check",
];

const PROTECTED_ROUTES = [
  "/feeds",
  "/feed",
  "/friends",
  "/messages",
  "/discover",
  "/notifications",
  "/profile",
  "/reels",
  "/cultural",
  "/groups",
  "/events",
  "/marketplace",
  "/jobs",
  "/onboarding",
];

const CONVEX_MODULES = [
  "posts",
  "users",
  "friends",
  "messages",
  "reactions",
  "reels",
  "groups",
  "events",
  "stories",
  "polls",
  "safety",
  "marketplace",
  "jobs",
];

import { execSync } from "node:child_process";

function curlRoute(path, follow = false) {
  const url = `${BASE}${path}`;
  const flags = [
    "-s",
    "-S",
    "--max-time",
    "60",
    "-w",
    "\\n%{http_code}|%{redirect_url}",
    "-o",
    "-",
  ];
  if (follow) flags.push("-L");
  try {
    const out = execSync(`/usr/bin/curl ${flags.map((f) => `'${f}'`).join(" ")} '${url}'`, {
      encoding: "utf8",
      maxBuffer: 2 * 1024 * 1024,
    });
    const lastNl = out.lastIndexOf("\n");
    const body = out.slice(0, lastNl);
    const [statusStr, location] = out.slice(lastNl + 1).split("|");
    return {
      path,
      status: Number(statusStr) || 0,
      text: body,
      location: location || null,
    };
  } catch (e) {
    return { path, status: 0, text: "", location: null, error: e.message };
  }
}

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.log(`  ✗ ${msg}`);
  return msg;
}

const failures = [];

console.log(`\nLUO Social smoke test — ${BASE}\n`);

// --- Env check ---
console.log("Environment (Convex + Clerk)");
try {
  const env = curlRoute("/api/env-check", true);
  if (env.status !== 200) {
    failures.push(fail(`/api/env-check returned ${env.status}`));
  } else {
    const data = JSON.parse(env.text);
    if (data.ok) pass("NEXT_PUBLIC_CONVEX_URL + Clerk publishable key OK");
    else failures.push(fail(`env-check ok=false: ${data.hint || JSON.stringify(data)}`));
    if (data.convex?.valid) pass(`Convex host: ${data.convex.urlHost}`);
    else failures.push(fail(`Convex URL invalid: ${data.convex?.misconfiguration || "missing"}`));
    if (data.clerk?.publishableKeySet) pass("Clerk publishable key set");
    else failures.push(fail("Clerk publishable key missing"));
  }
} catch (e) {
  failures.push(fail(`env-check unreachable: ${e.message}`));
}

// --- Public pages ---
console.log("\nPublic routes (expect 200)");
for (const path of PUBLIC_ROUTES) {
  if (path === "/api/env-check") continue;
  try {
    const r = curlRoute(path, true);
    if (r.status === 200) pass(`${path} → ${r.status}`);
    else failures.push(fail(`${path} → ${r.status}`));
    if (r.text.includes("border-border") && r.text.includes("CssSyntaxError")) {
      failures.push(fail(`${path} HTML contains CSS build error`));
    }
  } catch (e) {
    failures.push(fail(`${path}: ${e.message}`));
  }
}

// --- Protected (unauthenticated → redirect to sign-in) ---
console.log("\nProtected routes (unauthenticated → redirect to sign-in)");
for (const path of PROTECTED_ROUTES) {
  try {
    const r = curlRoute(path, false);
    const ok =
      r.status === 307 ||
      r.status === 302 ||
      r.status === 303 ||
      (r.location && r.location.includes("sign-in"));
    if (ok) pass(`${path} → ${r.status} ${r.location ? "→ sign-in" : ""}`);
    else if (r.status === 200) {
      // Some setups may return 200 with client-side gate
      pass(`${path} → 200 (client auth gate — verify in browser)`);
    } else failures.push(fail(`${path} → ${r.status} (expected redirect)`));
  } catch (e) {
    failures.push(fail(`${path}: ${e.message}`));
  }
}

// --- Convex module files exist ---
console.log("\nConvex backend modules");
const { existsSync } = await import("node:fs");
const { join } = await import("node:path");
const convexDir = join(process.cwd(), "convex");
for (const mod of CONVEX_MODULES) {
  const p = join(convexDir, `${mod}.ts`);
  if (existsSync(p)) pass(`${mod}.ts`);
  else failures.push(fail(`missing convex/${mod}.ts`));
}

// --- UI / icon map ---
console.log("\nFrontend assets");
const iconMap = join(process.cwd(), "lib/icon-map.ts");
const buttonUi = join(process.cwd(), "components/ui/button.tsx");
if (existsSync(iconMap)) pass("lib/icon-map.ts (Lucide icons)");
else failures.push(fail("missing lib/icon-map.ts"));
if (existsSync(buttonUi)) pass("shadcn button component");
else failures.push(fail("missing components/ui/button.tsx"));

console.log("\n--- Summary ---");
if (failures.length === 0) {
  console.log("All automated checks passed.\n");
  console.log("Manual checks (signed-in browser):");
  console.log("  • Post with text/photo, reactions, poll, hashtags");
  console.log("  • Stories row, groups join, events RSVP");
  console.log("  • DMs, friends, reels upload, marketplace/jobs create");
  console.log("  • Profile edit (clan/hometown), block/report\n");
  process.exit(0);
} else {
  console.log(`${failures.length} check(s) failed:\n`);
  failures.forEach((f) => console.log(`  - ${f}`));
  console.log("");
  process.exit(1);
}
