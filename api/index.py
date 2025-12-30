from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

def get_game_icon(place_id):
    try:
        # 512x512 PNG rbxcdn linkini çeker
        thumb_url = f"https://thumbnails.roblox.com/v1/places/gameicons?placeIds={place_id}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false"
        res = requests.get(thumb_url, timeout=5).json()
        return res["data"][0].get("imageUrl") if "data" in res else None
    except:
        return None

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q', 'deneme')
    try:
        # Kullanıcının girdiği limit değerini al, girilmemişse 10 yap
        limit = int(request.args.get('limit', 10))
    except ValueError:
        limit = 10
    
    url = f"https://apis.roblox.com/search-api/omni-search?searchQuery={query}&sessionId=vercel_hhasan"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        raw_results = data.get("searchResults", [{}])[0].get("contents", [])
        
        # Kullanıcının istediği limit kadarını kes
        limited_results = raw_results[:limit]
        
        final_data = []
        for item in limited_results:
            place_id = item.get("rootPlaceId")
            if place_id:
                final_data.append({
                    "name": item.get("name"),
                    "id": place_id,
                    "image": get_game_icon(place_id)
                })
        
        return jsonify({
            "status": "success",
            "query": query,
            "count": len(final_data),
            "results": final_data
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Vercel'in Flask'ı tanıması için
def handler(environ, start_response):
    return app(environ, start_response)
