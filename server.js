const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const app = express();

const TARGET_URL = 'https://voidagon.co.uk';

app.use('/proxy', createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
    selfHandleResponse: true, // Required to use responseInterceptor
    on: {
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            const response = responseBuffer.toString('utf8');
            
            // This strips the modal and the blobs from the HTML source itself
            return response
                .replace(/<div id="whitelist-prompt-modal"[\s\S]*?<\/div>/, '')
                .replace(/<div id="wl-blobs"[\s\S]*?<\/div>/, '');
        }),
    },
}));

app.get('/', (req, res) => {
    res.send(`
        <body style="margin:0;overflow:hidden;background:#000">
            <iframe src="/proxy/embed" style="width:100%;height:100%;border:none;"></iframe>
        </body>
    `);
});

app.listen(3000, '0.0.0.0', () => console.log('Hotspot Server active on port 3000'));
