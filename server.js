const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = 'https://voidagon.co.uk/embed';

// We have removed the http-proxy-middleware entirely.

app.get('/', (req, res) => {
    // Send a clean, full-screen iframe
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Embed</title>
            <style>
                body, html { 
                    margin: 0; 
                    padding: 0; 
                    height: 100%; 
                    width: 100%;
                    overflow: hidden; 
                }
                iframe { 
                    border: none; 
                    width: 100%; 
                    height: 100%; 
                    display: block;
                }
            </style>
        </head>
        <body>
            <iframe 
                src="${TARGET_URL}" 
                allowfullscreen 
                sandbox="allow-scripts allow-same-origin allow-forms">
            </iframe>
        </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
