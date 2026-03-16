const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// إعدادات الوكيل المحسنة
const proxyOptions = {
    target: 'https://chatgpt.com',
    changeOrigin: true,
    followRedirects: true,
    secure: true,
    // محاكاة متصفح حقيقي تماماً
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    },
    onProxyReq: (proxyReq, req, res) => {
        // نقل الكوكيز إذا وجدت
        if (req.headers.cookie) {
            proxyReq.setHeader('Cookie', req.headers.cookie);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        // تعديل الروابط في الصفحات
        if (proxyRes.headers['content-type']?.includes('text/html')) {
            let body = '';
            proxyRes.on('data', (chunk) => { body += chunk; });
            proxyRes.on('end', () => {
                // استبدال روابط ChatGPT بروابط الوكيل
                body = body.replace(
                    /(href|src)="(https?:\/\/chatgpt\.com)?(\/[^"]*)"/g,
                    `$1="https://${req.headers.host}$3"`
                );
                res.setHeader('content-length', Buffer.byteLength(body));
                res.end(body);
            });
        } else {
            // للمحتوى غير HTML، نمرره كما هو
            proxyRes.pipe(res);
        }
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send(`Proxy Error: ${err.message}`);
    }
};

// نقطة فحص الصحة
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Proxy is running' });
});

// تطبيق الوكيل
app.use('/', createProxyMiddleware(proxyOptions));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Enhanced proxy running on port ${PORT}`);
});
