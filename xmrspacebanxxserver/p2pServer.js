
const webSocket = require('ws');
const https = require('https');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit= require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

const MESSAGE_TYPES = {
	chain: 'CHAIN',
	transaction: 'TRANSACTION',
	clear_transactions: 'CLEAR_TRANSACTIONS'
}

const options = {
 key: fs.readFileSync('privkey.pem'),
 cert: fs.readFileSync('fullchain.pem'),
};

const peers = ["wss://www.xmrspacebanxx.com:5006"];
const P2P_PORT = 5006;

class p2pServer {

	constructor(blockchain, transactionPool) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.sockets = [];
	}

	listen(){
		const httpsServer = https.createServer(options, app).listen(P2P_PORT, () => {
			 console.log(`Server running on https://xmrspacebanxx.com:${P2P_PORT}`);
		});
		const wss = new webSocket.Server({server: httpsServer});
		wss.on('connection', socket => this.connectSocket(socket));
		this.connectToPeers();
		app.use(express.static('public'));
		app.use(helmet());
		const limiter = rateLimit({
			windowMs: 15 * 60 * 1000,
			max: 100,
		});
		app.use(limiter);
		app.use(cookieParser());
	}

	connectToPeers() {
		peers.forEach(peer => {
			this.connectToPeer(peer);
		});
	}

	connectToPeer(peer) {
		const socket = new webSocket(peer);
		socket.on('open', () => this.connectSocket(socket));
	}

	connectSocket(socket) {
		this.sockets.push(socket);
		console.log(`[+]Socket connected: ${socket._socket.remoteAddress}`);
		this.messageHandler(socket);
		this.sendChain(socket);
		socket.on('close', () => this.handleSocketClose(socket));
		socket.on('error', () => this.handleSocketClose(socket));
	}

	handleSocketClose(socket) {
		const index = this.sockets.indexOf(socket);
		if (index >= 0) {
			console.log(`[-]Socket disconnected: ${socket._socket.remoteAddress}`);
			this.sockets.splice(index, 1);
		}
	}

	messageHandler(socket) {
		socket.on('message', message => {
			const data = JSON.parse(message);
			switch(data.type) {
				case MESSAGE_TYPES.chain:
					this.blockchain.replaceChain(data.chain)
					break;
				case MESSAGE_TYPES.transaction:
					this.transactionPool.updateAddTransaction(data.transaction);
					console.log(`Transaction received from Socket: ${socket._socket.remoteAddress}`);
					break;
				case MESSAGE_TYPES.clear_transactions:
					this.transactionPool.clearTransactions(data.clearTransactions);
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

	syncChains() {
		this.sockets.forEach(socket => {
			this.sendChain(socket);
		});
	}

	broadcastTransaction(transaction) {
		this.sockets.forEach(socket => socket.send(JSON.stringify({
			type: MESSAGE_TYPES.clear_transactions
		})));
	}

	broadcastClearTransactions() {
		this.sockets.forEach(socket => socket.send(JSON.stringify({
			type: MESSAGE_TYPES.clear_transactions
		})));
	}
}

module.exports = p2pServer;
