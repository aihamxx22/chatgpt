const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('*', async (req, res) => {
    try {
        const targetUrl = 'https://chatgpt.com' + req.originalUrl;
        
        console.log(`Proxying: ${req.method} ${targetUrl}`);

        // هيدرز متصفح Chrome حقيقي بالكامل
        const headers = {
            'Accept': req.headers.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9,ar;q=0.8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Host': 'chatgpt.com',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        };

        if (req.headers.cookie) {
            headers.Cookie = req.headers.cookie;
        }

        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: headers,
            data: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
            responseType: 'arraybuffer',
            maxRedirects: 5,
            validateStatus: false,
            timeout: 30000,
            withCredentials: true,
            decompress: true
        });

        // إعادة الهيدرز المهمة
        const excludeHeaders = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];
        Object.entries(response.headers).forEach(([key, value]) => {
            if (!excludeHeaders.includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });

        res.status(response.status).send(response.data);
        
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).send(`Proxy Error: ${error.message}`);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✅ Proxy running on port ${PORT}`);
    console.log(`➡️  Open: https://chatgpt-web-proxy.onrender.com`);
});
