const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚡ WEBSHARE PROXY CONFIG
const PROXY_HOST = 'p.webshare.io';
const PROXY_PORT = '80';
const PROXY_USER = 'vqzxeigc-8';
const PROXY_PASS = '46ac2rykkjam';
const PROXY_URL = `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`;

// ⚡ User-Agents rotatifs
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

app.use(cors());

app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Vinted Alert Proxy PRO',
    proxy: 'Webshare Residential FR',
    uptime: process.uptime() 
  });
});

app.get('/fetch', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    console.log(`📡 Fetching via FR proxy: ${targetUrl}`);

    // ⚡ FETCH via WEBSHARE PROXY
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      },
      httpsAgent: new HttpsProxyAgent(PROXY_URL),
      proxy: false, // Disable axios default proxy
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    console.log(`✅ Success via proxy: ${response.status}`);

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
  console.log(`🇫🇷 Using Webshare FR proxy: ${PROXY_HOST}`);
});


