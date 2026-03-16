const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// وكيل شفاف - ينقل كل شيء كما هو
app.use('/', createProxyMiddleware({
    target: 'https://chatgpt.com',
    changeOrigin: true,
    followRedirects: true,
    secure: true,
    // لا تعدل أي شيء في المحتوى
    selfHandleResponse: false,
    // انقل كل الهيدرز كما هي
    onProxyReq: (proxyReq, req, res) => {
        // حافظ على الهيدرز الأصلية
        if (req.headers['user-agent']) {
            proxyReq.setHeader('User-Agent', req.headers['user-agent']);
        }
        if (req.headers['accept']) {
            proxyReq.setHeader('Accept', req.headers['accept']);
        }
        if (req.headers['accept-language']) {
            proxyReq.setHeader('Accept-Language', req.headers['accept-language']);
        }
        if (req.headers['cookie']) {
            proxyReq.setHeader('Cookie', req.headers['cookie']);
        }
        proxyReq.setHeader('Referer', 'https://chatgpt.com/');
        proxyReq.setHeader('Origin', 'https://chatgpt.com');
    },
    // عالج الأخطاء
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
    }
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 شفاف Proxy running on port ${PORT}`);
    console.log(`➡️  افتح: https://your-app.onrender.com`);
});