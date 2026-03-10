/const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Render uses a dynamic port; fallback to 10000 if running locally
const PORT = 3000; 

app.use('/', createProxyMiddleware({
    target: 'https://feeding-cordless-devel-student.trycloudflare.com',
    changeOrigin: true,
    ws: true, // Support for WebSockets
    onProxyRes: function (proxyRes, req, res) {
        // Fix for potential CORS or block issues
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy live on port ${PORT}`);
});
