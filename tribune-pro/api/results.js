// Statut et score à 90 minutes de fixtures précis (ids séparés par des tirets, 20 max).
const { call } = require("./_lib");
const FINAL = ["FT", "AET", "PEN"];
const VOID = ["CANC", "ABD", "AWD", "WO"]; // paris remboursés

module.exports = async (req, res) => {
  try {
    const ids = String(req.query.ids || "").split("-").filter((x) => /^\d+$/.test(x)).slice(0, 20);
    if (!ids.length) return res.status(400).json({ error: "ids manquants" });
    const j = await call("/fixtures", { ids: ids.join("-") });
    const out = {};
    for (const f of j.response) {
      const s = f.fixture.status.short;
      const ft = f.score && f.score.fulltime;
      out[f.fixture.id] = {
        s,
        final: FINAL.includes(s) && !!ft && ft.home != null,
        void: VOID.includes(s),
        hg: ft ? ft.home : null,
        ag: ft ? ft.away : null,
      };
    }
    const ttl = Number(process.env.RESULTS_CACHE_SECONDS) || 300;
    res.setHeader("Cache-Control", `public, s-maxage=${ttl}, stale-while-revalidate=${ttl}`);
    res.status(200).json(out);
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
};
