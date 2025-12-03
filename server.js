const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚡ CORS pour ton frontend
app.use(cors());

// ⚡ Health check pour Render
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Vinted Alert Proxy',
    uptime: process.uptime() 
  });
});

// ⚡ ENDPOINT principal : /fetch?url=...
app.get('/fetch', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    console.log(`📡 Fetching: ${targetUrl}`);

    // ⚡ Fetch Vinted avec headers PARFAITS
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.vinted.fr/',
      },
      timeout: 15000, // 15 secondes max
      validateStatus: () => true, // Accepter toutes les réponses
    });

    console.log(`✅ Success: ${response.status}`);

    // Retourner le HTML
    res.set('Content-Type', 'text/html');
    res.send(response.data);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    res.status(500).json({ 
      error: 'Fetch failed',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// ⚡ Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
