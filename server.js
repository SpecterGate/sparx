const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = 'https://voidagon.co.uk';

app.get('/', (req, res) => {
    // This sends only the iframe with no verification UI
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Voidagon</title>
            <style>
                body, html { 
                    margin: 0; 
                    padding: 0; 
                    height: 100%; 
                    width: 100%;
                    overflow: hidden; 
                    background-color: #000;
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
