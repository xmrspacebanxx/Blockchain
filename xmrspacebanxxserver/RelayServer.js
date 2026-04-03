const webSocket = require('ws');
const https = require('https');
const http = require('http');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
//const rateLimit= require('express-rate-limit');
//const cookieParser = require('cookie-parser');
//const path = require('path');
const app = express();

const options = {
 key: fs.readFileSync('./privkey.pem'),
 cert: fs.readFileSync('./fullchain.pem'),
};

const P2P_PORT = 5002;
const sockets = [];

const httpsServer = https.createServer(options, app).listen(P2P_PORT, () => {
    console.log('\x1b[32m%s\x1b[0m', `Server running on https://xmrspacebanxx.com:${P2P_PORT}`);
});

const wss = new webSocket.Server({server: httpsServer});

wss.on('connection', (socket) => {
    console.log('\x1b[32m%s\x1b[0m', `[+]Socket connected: ${socket._socket.remoteAddress}`);
    sockets.push(socket);

    socket.on('message', (message) => {
        //console.log('Received message:', message);
        const data = JSON.parse(message);
        sockets.forEach(socket => {
                socket.send(message);
                //console.log('Send message:', message);
        });
    });

    socket.on('close', () => {
        console.log('\x1b[32m%s\x1b[0m', `[-]Socket disconnected: ${socket._socket.remoteAddress}`);
        sockets.splice(sockets.indexOf(socket), 1);
    });

});

app.use(express.static('public'));
app.use(helmet());
