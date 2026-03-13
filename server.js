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
    target: 'https://play.blooket.com/play',
    changeOrigin: true,
    ws: true,
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const contentType = proxyRes.headers['content-type'];

        if (contentType && contentType.includes('text/html')) {
            let html = responseBuffer.toString('utf8');

            const injectedContent = `
                <script>
                    function runUserScript() {
                        (function(){
                            function getStateNode() {
                                return Object.values(document.querySelector("#app>div>div")).find(e=>e.children).children.find(m=>m._owner&&m._owner.stateNode)._owner.stateNode;
                            }
                            function bypass(){
                                let _bypass = document.createElement("iframe");
                                _bypass.style.display = 'none';
                                document.body.appendChild(_bypass);
                                return {window: _bypass.contentWindow, document: _bypass.contentDocument}
                            }
                            try {
                                let plname = bypass().window.prompt("Player name");
                                let cryptoA = bypass().window.prompt("Crypto amount (blank for fun)");
                                getStateNode().props.liveGameController.setVal({
                                    path: "c/" + getStateNode().props.client.name,
                                    val: {
                                        b: getStateNode().props.client.blook,
                                        cr: getStateNode().state.crypto,
                                        p: getStateNode().state.password,
                                        tat: plname + ":" + (cryptoA ? -cryptoA : Number.MAX_SAFE_INTEGER)
                                    }
                                });
                            } catch (e) {
                                alert("Error: Make sure you are on the right screen!");
                                console.error(e);
                            }
                        })();
                    }
                </script>
                <div style="position:fixed; top:10px; right:10px; z-index:9999; display:flex; flex-direction:column; gap:5px; background:rgba(0,0,0,0.7); padding:10px; border-radius:8px;">
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
    console.log(`Proxy running on port ${PORT}`);
});
