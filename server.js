const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const app = express();

const TARGET_URL = 'https://voidagon.co.uk/embed';

app.use('/proxy', createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
    selfHandleResponse: true, 
    on: {
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            const response = responseBuffer.toString('utf8');

            // ONLY modify if the file is HTML. 
            // This prevents breaking CSS, JS, and Socket.io files.
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                return response
                    .replace(/<div id="whitelist-prompt-modal"[\s\S]*?<\/div>/, '')
                    .replace(/<div id="wl-blobs"[\s\S]*?<\/div>/, '');
            }

            // Otherwise, return the original file (CSS/JS) exactly as it is
            return responseBuffer;
        }),
    },
}));

app.get('/', (req, res) => {
    // Adding DOCTYPE fixes the "Quirks Mode" error
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Voidagon Live</title>
            <style>
                body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #000; }
                iframe { border: none; width: 100%; height: 100%; display: block; }
            </style>
        </head>
        <body>
            <iframe src="/proxy/embed" allowfullscreen></iframe>
        </body>
        </html>
    `);
});

app.listen(3000, '0.0.0.0', () => console.log('Proxy running on port 3000'));
