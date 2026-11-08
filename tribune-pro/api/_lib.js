// Utilitaires partagés (le préfixe _ empêche Vercel d'en faire une route).
const BASE = "https://v3.football.api-sports.io";
// Ids des compétitions chez API-Football
const LEAGUES = { L1: 61, PL: 39, LL: 140, SA: 135, BL: 78, CL: 2 };

function season() {
  if (process.env.SEASON) return Number(process.env.SEASON);
  const d = new Date();
  return d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
}

async function call(path, params = {}) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error("Variable d'environnement API_FOOTBALL_KEY manquante");
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url, { headers: { "x-apisports-key": key } });
  if (!r.ok) throw new Error("API-Football HTTP " + r.status);
  const j = await r.json();
  const e = j.errors;
  if (e && (Array.isArray(e) ? e.length : Object.keys(e).length)) {
    throw new Error("API-Football : " + JSON.stringify(e));
  }
  return j;
}

module.exports = { call, LEAGUES, season };
