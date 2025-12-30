const express = require('express');
const axios = require('axios');
const app = express();

async function getGameIcon(placeId) {
    try {
        const url = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`;
        const res = await axios.get(url);
        return res.data.data[0]?.imageUrl || null;
    } catch {
        return null;
    }
}

app.get('/api/search', async (req, res) => {
    const query = req.query.q || 'deneme';
    const limit = parseInt(req.query.limit) || 10;

    const searchUrl = `https://apis.roblox.com/search-api/omni-search?searchQuery=${encodeURIComponent(query)}&sessionId=vercel_node`;

    try {
        const response = await axios.get(searchUrl);
        const rawResults = response.data.searchResults[0]?.contents || [];
        
        // Limite göre kes
        const limitedResults = rawResults.slice(0, limit);

        // Her oyunun ikonunu çek (Promise.all ile hızlı işlem)
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
            query: query,
            count: finalData.filter(x => x !== null).length,
            results: finalData.filter(x => x !== null)
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = app;
