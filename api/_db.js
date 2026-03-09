/**
 * _db.js — Shared license store for Vercel serverless functions.
 *
 * Vercel serverless functions are stateless, so we use Vercel KV (Redis)
 * for persistent storage. If KV isn't set up yet, it falls back to a
 * simple in-memory object (fine for testing, not production).
 *
 * SETUP: In your Vercel dashboard → Storage → Create KV Database
 * Then add the auto-generated KV_* env vars to your project.
 */

const crypto = require("crypto");

// ── License key generator ──────────────────────────────────────
function generateLicenseKey() {
  const rand = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `TBLK-${rand()}-${rand()}-${rand()}`;
}

// ── Storage ───────────────────────────────────────────────────
// Uses Vercel KV if available, otherwise falls back to in-memory (dev only)
let _memDB = {};

async function getDB() {
  if (process.env.KV_REST_API_URL) {
    // Vercel KV path
    const { kv } = require("@vercel/kv");
    const keys = await kv.keys("license:*");
    const db = {};
    if (keys.length > 0) {
      const values = await Promise.all(keys.map((k) => kv.get(k)));
      keys.forEach((k, i) => {
        const licKey = k.replace("license:", "");
        db[licKey] = values[i];
      });
    }
    return db;
  }
  return _memDB;
}

async function saveDB(db) {
  if (process.env.KV_REST_API_URL) {
    const { kv } = require("@vercel/kv");
    await Promise.all(
      Object.entries(db).map(([key, val]) => kv.set(`license:${key}`, val))
    );
    return;
  }
  _memDB = db;
}

module.exports = { getDB, saveDB, generateLicenseKey };
