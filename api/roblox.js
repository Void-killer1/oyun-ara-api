// /api/roblox.js
export default async function handler(req, res) {
  const { q } = req.query;

  // Eğer query yoksa hata ver
  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Lütfen arama kelimesi girin (query param 'q')." });
  }

  try {
    // Roblox oyun arama endpoint
    const url = `https://games.roblox.com/v1/games/list?keyword=${encodeURIComponent(q)}&limit=10`;
    const r = await fetch(url);
    const data = await r.json();

    // Eğer data.data yok veya boşsa
    if (!data.data || data.data.length === 0) {
      return res.status(404).json({ error: "Oyun bulunamadı." });
    }

    // CORS izinleri ekle
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    // Başarıyla veri gönder
    res.status(200).json(data);

  } catch (err) {
    // Beklenmeyen hata
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: err.message || "Bilinmeyen bir hata oluştu." });
  }
}
