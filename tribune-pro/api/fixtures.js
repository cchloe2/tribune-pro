// Matchs à venir + cotes 1N2 pré-match + derniers résultats, pour les 6 compétitions.
// Le résultat est mis en cache par le CDN de Vercel pour économiser le quota de l'API.
const { call, LEAGUES, season } = require("./_lib");
const BOOKMAKER = process.env.BOOKMAKER || "8"; // 8 = Bet365 chez API-Football (vérifie /odds/bookmakers)

async function allOdds(id, S) {
  const out = [];
  let page = 1, total = 1;
  do {
    const j = await call("/odds", { league: id, season: S, bet: 1, bookmaker: BOOKMAKER, page });
    out.push(...j.response);
    total = (j.paging && j.paging.total) || 1;
    page++;
  } while (page <= total && page <= 4);
  return out;
}

function parseOdds(items) {
  const map = {};
  for (const it of items) {
    const bk = it.bookmakers && it.bookmakers[0];
    const bet = bk && bk.bets && bk.bets.find((b) => b.id === 1); // 1 = Match Winner
    if (!bet) continue;
    const g = (n) => Number((bet.values.find((v) => v.value === n) || {}).odd);
    const o = [g("Home"), g("Draw"), g("Away")];
    if (o.every((x) => x > 1)) map[it.fixture.id] = o;
  }
  return map;
}

async function league(code, id, S) {
  const [next, last, odds] = await Promise.all([
    call("/fixtures", { league: id, season: S, next: 10 }),
    call("/fixtures", { league: id, season: S, last: 10 }),
    allOdds(id, S),
  ]);
  const om = parseOdds(odds);
  const matches = next.response
    .filter((f) => f.fixture.status.short === "NS" && om[f.fixture.id])
    .map((f) => ({
      id: String(f.fixture.id), c: code, t: f.fixture.date,
      hn: f.teams.home.name, an: f.teams.away.name,
      hl: f.teams.home.logo, al: f.teams.away.logo,
      o: om[f.fixture.id],
    }));
  const past = last.response
    .filter((f) => f.fixture.status.short === "FT" && f.score && f.score.fulltime && f.score.fulltime.home != null)
    .map((f) => ({
      c: code, t: f.fixture.date,
      hn: f.teams.home.name, an: f.teams.away.name,
      hl: f.teams.home.logo, al: f.teams.away.logo,
      hg: f.score.fulltime.home, ag: f.score.fulltime.away,
    }));
  return { matches, past };
}

module.exports = async (req, res) => {
  try {
    const S = season();
    const settled = await Promise.allSettled(Object.entries(LEAGUES).map(([c, id]) => league(c, id, S)));
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
