// Matchs à venir + derniers résultats, pour les 6 compétitions.
const { call, LEAGUES } = require("./_lib");

async function league(code, leagueCode) {
  // Récupère les matchs de la compétition (statuts SCHEDULED, TIMED, FINISHED)
  const data = await call(`/competitions/${leagueCode}/matches`);
  const matchesList = data.matches || [];

  // Matchs à venir (prochains)
  const nextMatches = matchesList
    .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
    .slice(0, 10);

  // Derniers résultats
  const lastMatches = matchesList
    .filter((m) => m.status === "FINISHED")
    .reverse() // Pour avoir les plus récents en premier
    .slice(0, 10);

  const matches = nextMatches.map((m) => ({
    id: String(m.id),
    c: code,
    t: m.utcDate,
    hn: m.homeTeam.name,
    an: m.awayTeam.name,
    hl: m.homeTeam.crest,
    al: m.awayTeam.crest,
    o: [2.0, 3.2, 3.5], // Valeur par défaut car l'API gratuite ne fournit pas les cotes
  }));

  const past = lastMatches.map((m) => ({
    c: code,
    t: m.utcDate,
    hn: m.homeTeam.name,
    an: m.awayTeam.name,
    hl: m.homeTeam.crest,
    al: m.awayTeam.crest,
    hg: m.score.fullTime.home,
    ag: m.score.fullTime.away,
  }));

  return { matches, past };
}

module.exports = async (req, res) => {
  try {
    const settled = await Promise.allSettled(
      Object.entries(LEAGUES).map(([c, leagueCode]) => league(c, leagueCode))
    );
    const ok = settled.filter((s) => s.status === "fulfilled").map((s) => s.value);
    const warnings = settled.filter((s) => s.status === "rejected").map((s) => String(s.reason && s.reason.message));
    
    if (!ok.length) throw new Error(warnings[0] || "Aucune donnée");
    
    const ttl = Number(process.env.CACHE_SECONDS) || 21600; // 6 h par défaut
    res.setHeader("Cache-Control", `public, s-maxage=${ttl}, stale-while-revalidate=${ttl}`);
    res.status(200).json({
      asof: new Date().toISOString(),
      matches: ok.flatMap((p) => p.matches),
      past: ok.flatMap((p) => p.past),
      warnings,
    });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
};
