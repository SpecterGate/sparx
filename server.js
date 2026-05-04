const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = 'https://voidagon.co.uk';

// 1. The Proxy Logic
const proxy = createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
    ws: true,
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
});

// 2. Route Controller
app.get('/', (req, res, next) => {
    // If the URL has ?mode=proxy, skip this and go to the proxy middleware
    if (req.query.mode === 'proxy') {
        return next();
    }

    // Otherwise, send the HTML with the iframe and banner
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: sans-serif; }
                #banner {
                    background: #ff0000;
                    color: white;
                    padding: 10px;
                    text-align: center;
                    position: relative;
                    z-index: 9999;
                }
                #banner a { color: white; font-weight: bold; text-decoration: underline; cursor: pointer; }
                #close-x {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    font-weight: bold;
                }
                iframe { width: 100%; height: calc(100% - 40px); border: none; }
            </style>
        </head>
        <body>
            <div id="banner">
                <span onclick="window.location.href='/?mode=proxy'">See nothing? click here</span>
                <span id="close-x" onclick="document.getElementById('banner').style.display='none'; document.querySelector('iframe').style.height='100%'">X</span>
            </div>
            <iframe src="${TARGET_URL}"></iframe>
        </body>
        </html>
    `);
});

// 3. Apply the proxy to all requests that aren't caught by the HTML route
// or those that passed through via next()
app.use('/', proxy);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
