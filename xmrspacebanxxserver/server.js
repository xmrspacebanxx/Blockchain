
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const app = express();

const options = {
 key: fs.readFileSync('privkey.pem'),
 cert: fs.readFileSync('fullchain.pem'),
};

app.get('/', (req,res) => {
 res.send('Loading server...\n');
});

https.createServer(options, app).listen(5006, () => {
 console.log('Server running on https://xmrspacebanxx.com:5006');
});

//http.createServer((req, res) => {
// res.writeHead(301, { "Location": `https://${req.headers.host.replace(':5002', ':5001')}${req.url}` });
// res.end();
//}).listen(5002, () => {
// console.log('Server HTTP redirigiendo a HTTPS en el puerto 5001');
//});
