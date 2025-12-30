const express = require('express');
const axios = require('axios');
const app = express();

// Oyun ikonu çeken yardımcı fonksiyon
async function getGameIcon(placeId) {
    try {
        const url = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`;
        const res = await axios.get(url);
        return res.data.data[0]?.imageUrl || null;
    } catch {
        return null;
    }
}

// Ana arama rotası
app.get('/', async (req, res) => {
    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 10;

    // Eğer sorgu boşsa örnek kullanım göster
    if (!query) {
        return res.json({ 
            message: "Hoşgeldin! Aramak için ?q=oyun_adi&limit=5 şeklinde parametre ekle.",
            example: "/?q=adopt&limit=2" 
        });
    }

    try {
        const searchUrl = `https://apis.roblox.com/search-api/omni-search?searchQuery=${encodeURIComponent(query)}&sessionId=test`;
        const response = await axios.get(searchUrl);
        const rawResults = response.data.searchResults[0]?.contents || [];
        
        const limitedResults = rawResults.slice(0, limit);

        const finalData = await Promise.all(limitedResults.map(async (item) => {
            const placeId = item.rootPlaceId;
            if (!placeId) return null;
            
            return {
                name: item.name,
                id: placeId,
                image: await getGameIcon(placeId)
            };
        }));

        res.json({
            status: "success",
            count: finalData.filter(x => x !== null).length,
            results: finalData.filter(x => x !== null)
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Vercel için port ayarı
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server hazır: ${PORT}`));

module.exports = app;
