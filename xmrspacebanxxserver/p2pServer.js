
const webSocket = require('ws');
const { NETWORK } = require('./config');
const fs = require('fs');
const https = require('https');

const options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem'),
   };

//const peers = ["wss://xmrspacebanxx.com:5001"];
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const P2P_PORT = process.env.P2P_PORT || 5007;

const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clearTransactions: 'CLEAR_TRANSACTIONS'
}

class p2pServer{
    constructor(blockchain, transactionPool){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
        this.network = NETWORK;
    }

    listen(){
        const httpsServer = https.createServer(options);
        const server = new webSocket.Server({server : httpsServer});
        //const server = new webSocket.Server({port : P2P_PORT});
        server.on('connection', socket => this.connectSocket(socket));
        httpsServer.listen(P2P_PORT, '0.0.0.0', () => {
            console.log('Listen for secure peer-to-peer conections on port' + P2P_PORT);
        });
        this.connectToPeers();
    }

    connectToPeers() {
        peers.forEach(peer => {
            this.connectToPeer(peer);
        });
    }

    connectToPeer(peer) {
        const socket = new webSocket(peer);
        socket.on('open', () => this.connectSocket(socket));
        socket.on('close', () => this.handleDisconnect(peer));
        socket.on('error', () => this.handleDisconnect(peer));
    }

    handleDisconnect(peer) {
        console.log('\x1b[31m%s\x1b[0m', `[-]Connection to peer ${peer} lost...`);
        if(this.network) {
            console.log('[!] Already attempting reconnection.');
            return;
        }
        this.network = true;
        setTimeout(() => {
            console.log('[+] Attempting to reconnect to peer...');
            this.connectToPeers();
            this.network = false;
        }, 10000);
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('\x1b[36m%s\x1b[0m', `[+]Socket connected: ${socket._socket.remoteAddress}`);
        this.messageHandler(socket);
        this.sendChain(socket);
        socket.on('close', () => this.handleSocketClose(socket));
        socket.on('error', () => this.handleSocketClose(socket));
    }

    handleSocketClose(socket) {
        const index = this.sockets.indexOf(socket);
        if (index >= 0) {
            console.log('\x1b[35m%s\x1b[0m', `[-]Socket disconnected: ${socket._socket.remoteAddress}`);
            this.sockets.splice(index, 1);
        }
    }

    messageHandler(socket){
        socket.on('message', message =>{
            const data = JSON.parse(message);
            switch(data.type){
                /*case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain)
                    break;*/
                case MESSAGE_TYPES.transaction:
					console.log(`Transaction received from Socket: ${socket._socket.remoteAddress}`);
                    this.transactionPool.updateAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clearTransactions:
                    this.transactionPool.clearTransactions(data.clearTransactions);
                    break;
            }
        })
    }

    sendChain(socket){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
    }

    sendTransaction(socket, transaction){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }

    syncChains(){
        this.sockets.forEach(socket =>{
            this.sendChain(socket);
        });
    }

    broadcastTransaction(transaction){
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    broadcastClearTransactions(minedTransactions){
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clearTransactions,
            clearTransactions: minedTransactions
        })));
    }
}

module.exports = p2pServer;
