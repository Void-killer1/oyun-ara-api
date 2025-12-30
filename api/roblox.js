export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "query yok" });
  }

  const r = await fetch(
    `https://games.roblox.com/v1/games/list?keyword=${encodeURIComponent(q)}&limit=10`
  );
  const data = await r.json();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json(data);
}
