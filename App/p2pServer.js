const webSocket = require('ws');
require('dotenv').config();

const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const P2P_PORT = process.env.P2P_PORT || 5001;

const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS',
    items: 'ITEMS'
}

class p2pServer{
    constructor(blockchain, transactionPool, storePool){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.storePool = storePool;
        this.sockets = [];
        this.retryInterval = 360000; // Intervalo de reintento de reconexi�n (5 segundos)
    }

    listen() {
        const server = new webSocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        this.connectToPeers();
        console.log('Listening for peer to peer connections on port ' + P2P_PORT);
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
        console.log(`[-]Connection to peer ${peer} lost. Attempting to reconnect...`);
        setTimeout(() => this.connectToPeer(peer), this.retryInterval);
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('[+] Socket connected');
        this.messageHandler(socket);
        this.sendChain(socket);
        this.sendItems(socket);

        // Manejar eventos de cierre y error para sockets ya conectados
        socket.on('close', () => this.handleSocketClose(socket));
        socket.on('error', () => this.handleSocketClose(socket));
    }

    handleSocketClose(socket) {
        const index = this.sockets.indexOf(socket);
        if (index >= 0) {
            this.sockets.splice(index, 1);
            console.log('[-] Socket disconnected');
        }
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;
                case MESSAGE_TYPES.items:
                    this.storePool.replaceItems(data.items);
                    break;
            }
        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }

    sendItems(socket){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.items,
            items: this.storePool.items
        }));
    }

    syncChains(){
        this.sockets.forEach(socket =>{
            this.sendChain(socket);
        });
    }

    syncStore(){
        this.sockets.forEach(socket =>{
           this.sendItems(socket); 
        });
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }
}

module.exports = p2pServer;