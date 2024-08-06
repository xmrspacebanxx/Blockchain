
const webSocket = require('ws');

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
    }

    listen(){
        const server = new webSocket.Server({port : P2P_PORT});
        server.on('connection', socket => this.connectSocket(socket));
        this.connectToPeers();
        console.log('Listening for peer to peer connections on port ' + P2P_PORT);
    }

    connectToPeers(){
        peers.forEach(peer => {
            const socket = new webSocket(peer);
            socket.on('open', ()=> this.connectSocket(socket));
        })
    }

    connectSocket(socket){
        this.sockets.push(socket);
        console.log('[+]Socket connected');
        this.messageHandler(socket);
        this.sendChain(socket);
        this.sendItems(socket);
    }

    messageHandler(socket){
        socket.on('message', message =>{
            const data = JSON.parse(message);
            switch(data.type){
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain)
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clearTransactions(data.clearTransactions);
                    break;
                case MESSAGE_TYPES.items:
                    this.storePool.replaceItems(data.items);
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

    broadcastTransaction(transaction){
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction))
    }

    broadcastClearTransactions(){
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }
}

module.exports = p2pServer;