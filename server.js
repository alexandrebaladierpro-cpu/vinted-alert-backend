const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚡ Pool de 20 User-Agents réels et variés
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
];

// ⚡ Referers variés pour simuler navigation naturelle
const referers = [
  'https://www.google.com/',
  'https://www.google.fr/search?q=vinted',
  'https://www.vinted.fr/',
  'https://www.vinted.fr/catalog',
  'https://duckduckgo.com/',
  null, // Pas de referer (navigation directe)
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ⚡ Delay aléatoire entre requêtes (anti-bot)
function getRandomDelay() {
  return Math.floor(Math.random() * 2000) + 500; // 500ms à 2.5s
}

// ⚡ Cache simple en mémoire (évite de spammer Vinted)
const cache = new Map();
const CACHE_DURATION = 10000; // 10 secondes

app.use(cors());

app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Vinted Alert Proxy - Stealth Mode',
    uptime: process.uptime(),
    cache_size: cache.size
  });
});

app.get('/fetch', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // ⚡ Vérifier le cache d'abord
    const cached = cache.get(targetUrl);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log(`💾 Cache hit: ${targetUrl}`);
      res.set('Content-Type', 'text/html');
      res.set('X-Cache', 'HIT');
      return res.send(cached.data);
    }

    console.log(`📡 Fetching (stealth): ${targetUrl}`);

    // ⚡ Delay aléatoire avant la requête (comportement humain)
    await new Promise(resolve => setTimeout(resolve, getRandomDelay()));

    // ⚡ Headers ULTRA variables et réalistes
    const headers = {
      'User-Agent': getRandomElement(userAgents),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': Math.random() > 0.5 ? 'none' : 'same-origin',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    };

    // ⚡ Ajouter un referer aléatoire (50% du temps)
    const referer = getRandomElement(referers);
    if (referer) {
      headers['Referer'] = referer;
    }

    const response = await axios.get(targetUrl, {
      headers,
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    console.log(`✅ Success (stealth): ${response.status}`);

    // ⚡ Mettre en cache
    cache.set(targetUrl, {
      data: response.data,
      timestamp: Date.now()
    });

    // ⚡ Nettoyer le cache (garder max 50 entrées)
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    res.set('Content-Type', 'text/html');
    res.set('X-Cache', 'MISS');
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
  console.log(`🎭 Stealth mode: ${userAgents.length} User-Agents rotating`);
  console.log(`💾 Cache enabled: ${CACHE_DURATION}ms TTL`);
});
