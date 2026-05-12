const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sparx Maths 2</title>
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
