
const express = require('express');
const app = express();

const Blockchain = require('./Blockchain');
const Wallet = require('./Wallet');
const TransactionPool = require('./TransactionPool');
const p2pServer = require('./p2pServer');
const Miner = require('./Miner');

const bc = Blockchain.loadBlockchain();

Wallet.loadWallet()
	.then(wallet => {
		console.log('Wallet succesfully loaded:', wallet);
		const tp = new TransactionPool(bc);
		console.log('Transaction Pool ok!');
		const server = new p2pServer(bc, tp);
		console.log('Server ok!');
		const miner = new Miner(bc, tp, wallet, server);
		console.log('Miner ok!');

        app.get('/blocks', (req, res)=>{
            res.json(bc.chain);
        });
        console.log('Blocks ok!');
        app.get('/transactions',(req, res) => {
            res.json(tp.transactions);
        });
		console.log('Transactions ok!');
        app.post('/address-balance', (req, res) => {
            res.json(wallet.calculateBalance(bc, req.body.address));
        });
		console.log('Address balance ok!');
		server.listen();
		console.log('Server listen ok!');
		miner.mine();
		console.log('Miner start ok!');

	})
	.catch(error => {
		console.error('Failed to load wallet:', error.message);
		process.exit(1);
	});

		






