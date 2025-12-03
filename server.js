const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚡ User-Agents rotatifs pour éviter la détection
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// ⚡ CORS
app.use(cors());

// ⚡ Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Vinted Alert Proxy',
    uptime: process.uptime() 
  });
});

// ⚡ ENDPOINT principal
app.get('/fetch', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    console.log(`📡 Fetching: ${targetUrl}`);

    // ⚡ Headers ULTRA furtifs avec User-Agent rotatif
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
      timeout: 25000, // 25 secondes
      maxRedirects: 5,
      validateStatus: () => true,
    });

    console.log(`✅ Success: ${response.status}`);

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

