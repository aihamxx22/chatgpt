const express = require('express');
const axios = require('axios');
const app = express();

// زيادة الحد الأقصى
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// وسيط لمعالجة جميع الطلبات
app.use('*', async (req, res) => {
    try {
        // بناء URL الهدف
        const targetUrl = 'https://chatgpt.com' + req.originalUrl;
        
        console.log(`Proxying: ${req.method} ${targetUrl}`);

        // هيدرز متصفح حقيقي (Windows + Chrome)
        const headers = {
            'Accept': req.headers.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://chatgpt.com/',
            'Origin': 'https://chatgpt.com',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Connection': 'keep-alive'
        };

        // نقل الكوكيز إذا وجدت
        if (req.headers.cookie) {
            headers.Cookie = req.headers.cookie;
        }

        // إرسال الطلب
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: headers,
            data: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
            responseType: 'arraybuffer',
            maxRedirects: 5,
            validateStatus: false,
            timeout: 30000
        });

        // إعادة الهيدرز المهمة فقط
        const excludeHeaders = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];
        Object.entries(response.headers).forEach(([key, value]) => {
            if (!excludeHeaders.includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });

        // إرسال الرد
        res.status(response.status).send(response.data);
        
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).send(`Proxy Error: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Proxy running on port ${PORT}`);
    console.log(`➡️  Open: https://your-app.onrender.com`);
});
