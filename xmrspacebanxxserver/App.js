
const express = require('express');
const app = express();
const cors = require('cors');

const Blockchain = require('./Blockchain');
const Wallet = require('./Wallet');
const TransactionPool = require('./TransactionPool');
const p2pServer = require('./p2pServer');
const Miner = require('./Miner');

app.use(cors({ origin: 'http://r5yzdi2cr6jd3bdyxcx54py32ndqbbsjv6m7btgvjloscdpbksqrbcyd.onion' }));

const bc = Blockchain.loadBlockchain();
const tp = new TransactionPool(bc);
const server = new p2pServer(bc, tp);


Wallet.loadWallet()
	.then(wallet => {
		console.log('Wallet succesfully loaded:', wallet);
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

		






