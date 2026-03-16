const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// نقطة فحص الصحة - مهمة جداً للتأكد من عمل الخادم
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Proxy is running' });
});

// الوكيل الشفاف - ينقل كل الطلبات إلى ChatGPT
app.use('/', createProxyMiddleware({
    target: 'https://chatgpt.com',
    changeOrigin: true,
    followRedirects: true,
    secure: true,
    onProxyReq: (proxyReq, req, res) => {
        // الحفاظ على الهيدرز المهمة
        if (req.headers['user-agent']) {
            proxyReq.setHeader('User-Agent', req.headers['user-agent']);
        }
        if (req.headers['accept']) {
            proxyReq.setHeader('Accept', req.headers['accept']);
        }
        if (req.headers['cookie']) {
            proxyReq.setHeader('Cookie', req.headers['cookie']);
        }
        proxyReq.setHeader('Referer', 'https://chatgpt.com/');
        proxyReq.setHeader('Origin', 'https://chatgpt.com');
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error: ' + err.message);
    }
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Proxy server running on port ${PORT}`);
    console.log(`➡️  Open: https://your-app.onrender.com`);
});
