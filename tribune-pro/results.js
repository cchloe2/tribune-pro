// Statut et score à 90 minutes de fixtures précis.
const { call } = require("./_lib");
const FINAL = ["FINISHED"];
const VOID = ["CANCELLED", "POSTPONED", "SUSPENDED"]; 

module.exports = async (req, res) => {
  try {
    const ids = String(req.query.ids || "").split("-").filter((x) => /^\d+$/.test(x)).map(Number);
    if (!ids.length) return res.status(400).json({ error: "ids manquants" });

    // football-data.org permet de récupérer des matchs par leurs IDs spécifiques
    const data = await call("/matches", { ids: ids.join(",") });
    const out = {};

    for (const m of (data.matches || [])) {
      const s = m.status;
      const ft = m.score && m.score.fullTime;
      out[m.id] = {
        s,
        final: FINAL.includes(s) && ft && ft.home != null,
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