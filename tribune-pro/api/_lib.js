// Utilitaires partagés (le préfixe _ empêche Vercel d'en faire une route).
const BASE = "https://api.football-data.org/v4";

// Codes des compétitions sur football-data.org
const LEAGUES = {
  PL: "PL",   // Premier League
  FL1: "FL1", // Ligue 1
  PD: "PD",   // Primera Division / La Liga
  SA: "SA",   // Serie A
  BL1: "BL1", // Bundesliga
  CL: "CL"    // UEFA Champions League
};

async function call(path, params = {}) {
  const key = process.env.FOOTBALL_DATA_KEY;
  if (!key) throw new Error("Variable d'environnement FOOTBALL_DATA_KEY manquante");
  
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const r = await fetch(url, { headers: { "X-Auth-Token": key } });
  if (!r.ok) throw new Error("Football-Data HTTP " + r.status);
  
  return await r.json();
}

module.exports = { call, LEAGUES };
