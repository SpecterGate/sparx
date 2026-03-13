const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(basicAuth({
    users: { 'admin': '123456' },
    challenge: true
}));

const blooketProxy = createProxyMiddleware({
    target: 'https://play.blooket.com',
    changeOrigin: true,
    ws: true,
    secure: true,
    // Increase timeouts to prevent the "timing out" error
    proxyTimeout: 10000, 
    timeout: 10000,
    connectionTimeout: 10000,
    onProxyReq: (proxyReq, req, res) => {
        // Mimic a legitimate Chrome browser to bypass basic bot filters
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        proxyReq.setHeader('Referer', 'https://play.blooket.com/');
        proxyReq.setHeader('Origin', 'https://play.blooket.com');
    },
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const contentType = proxyRes.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
            let html = responseBuffer.toString('utf8');
            const injectedContent = `
                <script>
                    function runUserScript() {
                        try {
                            const root = document.querySelector("#app>div>div");
                            const stateNode = Object.values(root).find(e=>e.children).children.find(m=>m._owner&&m._owner.stateNode)._owner.stateNode;
                            let plname = prompt("New Player Name:");
                            stateNode.props.liveGameController.setVal({
                                path: "c/" + stateNode.props.client.name,
                                val: { b: stateNode.props.client.blook, cr: 99999, p: stateNode.state.password, tat: plname + ":-999999" }
                            });
                        } catch (e) { alert("Navigate to the game screen first!"); }
                    }
                </script>
                <div style="position:fixed; top:10px; right:10px; z-index:9999; background:rgba(0,0,0,0.8); padding:10px; border-radius:5px;">
                    <button onclick="runUserScript()" style="background:#00bcff; color:white; border:none; padding:10px; cursor:pointer; font-weight:bold;">Execute Hack</button>
                </div>
            `;
            return html.replace('<body>', `<body>${injectedContent}`);
        }
        return responseBuffer;
    })
});

app.use('/', blooketProxy);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
});
