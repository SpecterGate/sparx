const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const app = express();

const TARGET_URL = 'https://sparx-s7fh.onrender.com/embed';

app.use('/proxy', createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
    selfHandleResponse: true,
    on: {
        proxyReq: (proxyReq) => {
            // FORCE the target server to send plain text (no GZIP/Brotli)
            proxyReq.setHeader('accept-encoding', 'identity');
        },
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            const contentType = proxyRes.headers['content-type'] || '';

            // ONLY modify HTML files
            if (contentType.includes('text/html')) {
                const response = responseBuffer.toString('utf8');
                return response
                    .replace(/<div id="whitelist-prompt-modal"[\s\S]*?<\/div>/, '')
                    .replace(/<div id="wl-blobs"[\s\S]*?<\/div>/, '');
            }

            // Return CSS, JS, and Socket.io files exactly as they are
            return responseBuffer;
        }),
    },
}));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Live Preview</title>
            <style>
                body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #000; }
                iframe { border: none; width: 100%; height: 100%; display: block; }
            </style>
        </head>
        <body>
            <iframe src="https://sparx-s7fh.onrender.com/embed" allowfullscreen></iframe>
        </body>
        </html>
    `);
});

app.listen(3000, '0.0.0.0', () => console.log('Server live on port 3000'));
