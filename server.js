const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Password Protection (User: admin, Pass: 123456)
app.use(basicAuth({
    users: { 'admin': '123456' },
    challenge: true
}));

app.use('/', createProxyMiddleware({
    // Changed target to the base domain to avoid pathing errors
    target: 'https://play.blooket.com', 
    changeOrigin: true,
    ws: true,
    secure: true, // Ensures SSL is handled correctly
    selfHandleResponse: true,
    
    // Crucial: Blooket checks these headers to prevent unauthorized proxying
    onProxyReq: (proxyReq) => {
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        proxyReq.setHeader('Referer', 'https://play.blooket.com/');
        proxyReq.setHeader('Origin', 'https://play.blooket.com');
    },

    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const contentType = proxyRes.headers['content-type'];

        // Only inject if the response is actually HTML
        if (contentType && contentType.includes('text/html')) {
            let html = responseBuffer.toString('utf8');

            const injectedContent = `
                <script>
                    function runUserScript() {
                        (function(){
                            function getStateNode() {
                                // Added more robust selector for Blooket's React app
                                const root = document.querySelector("#app>div>div");
                                if (!root) return null;
                                return Object.values(root).find(e=>e.children).children.find(m=>m._owner&&m._owner.stateNode)._owner.stateNode;
                            }
                            function bypass(){
                                let _bypass = document.createElement("iframe");
                                _bypass.style.display = 'none';
                                document.body.appendChild(_bypass);
                                return {window: _bypass.contentWindow, document: _bypass.contentDocument}
                            }
                            try {
                                const node = getStateNode();
                                if (!node) throw new Error("Could not find game state.");
                                
                                let plname = bypass().window.prompt("Player name");
                                let cryptoA = bypass().window.prompt("Crypto amount (blank for fun)");
                                node.props.liveGameController.setVal({
                                    path: "c/" + node.props.client.name,
                                    val: {
                                        b: node.props.client.blook,
                                        cr: node.state.crypto,
                                        p: node.state.password,
                                        tat: plname + ":" + (cryptoA ? -cryptoA : Number.MAX_SAFE_INTEGER)
                                    }
                                });
                            } catch (e) {
                                alert("Error: Make sure you are in the game lobby or playing!");
                                console.error(e);
                            }
                        })();
                    }
                </script>
                <div style="position:fixed; top:10px; right:10px; z-index:9999; display:flex; flex-direction:column; gap:5px; background:rgba(0,0,0,0.8); padding:10px; border-radius:8px; border:1px solid #444;">
                    <a href="https://www.blooket.com" target="_blank" style="color:white; font-family:sans-serif; text-decoration:none; text-align:center; font-size:12px;">Blooket.com</a>
                    <button onclick="runUserScript()" style="cursor:pointer; background:#00bcff; color:white; border:none; padding:8px 12px; border-radius:4px; font-weight:bold;">Execute Script</button>
                </div>
            `;

            return html.replace('<body>', `<body>${injectedContent}`);
        }

        return responseBuffer;
    })
}));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy active at http://localhost:${PORT}`);
});
