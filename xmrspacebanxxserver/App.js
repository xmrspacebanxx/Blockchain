
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const Blockchain = require('./Blockchain');
const Wallet = require('./Wallet');
const TransactionPool = require('./TransactionPool');
const p2pServer = require('./p2pServer');
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const bodyParser = require('body-parser');
const Miner = require('./Miner');

const bc = Blockchain.loadBlockchain();
const BigNumber = require('bignumber.js');


Wallet.loadWallet()
	.then(wallet => {
		console.log('Wallet succesfully loaded:', wallet);

		const tp = new TransactionPool(bc);

		const server = new p2pServer(bc, tp);

		const miner = new Miner(bc, tp, wallet, server);
		console.log('Miner ok!');

		const app = express();

		app.use(helmet());

		const limiter = rateLimit({
			windowMs: 15 * 60 * 1000,
			max: 100,
		});

		app.use(limiter);

		app.use(cookieParser());

		app.use(bodyParser.urlencoded({ extended: false }));

		const csrfProtection = csrf({ cookie: true });

		app.use(csrfProtection);

		const privateKey = fs.readFileSync(path.resolve(__dirname, './public/key.pem'), 'utf8');
		const certificate = fs.readFileSync(path.resolve(__dirname, './public/cert.pem'), 'utf8');

		const credentials = {
			key: privateKey,
			cert: certificate		
		};

		const httpsServer = http.createServer(app);

		app.use(express.static(path.join(__dirname, 'public')));
		app.bodyParser = bodyParser.json();

		app.use((req, res, next) => {
			res.header("Content-Security-Policy", "default-src 'self'; connect-src 'self' http://localhost:3001; script-src 'self' 'unsafe-inline';");
			res.header("Access-Control-Allow-Origin", "http://localhost:3001"); // Restringe el acceso a localhost:3001
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
			next();
		});

		app.get('/public-key', (req, res) => {
			res.json(wallet.publicKey);
		});

		app.get('/private-key', (req, res) => {
			res.json(wallet.keyPair.getPrivate('hex'));
		});

		app.get('/address', async (req, res) => {
			const publicKey = wallet.publicKey;

			async function getAddress(publicKey, length=6) {
				const encoder = new TextEncoder();
				const data = encoder.encode(publicKey);
				const hashBuffer = await crypto.subtle.digest('SHA-256', data);
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				const characters = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
				let address = '';
				for (let i = 0; i < length; i++) {
					address += characters[hashArray[i] % characters.length];
				}
				return address;
			}

			try {
				const address = await getAddress(publicKey);
				res.json(address);
			} catch (error) {
				res.status(500).json({error: error.message});
			}
		});
		
		app.post('/transact', (req, res) => {
			const { recipient, amount } = req.body;
			const transaction = wallet.createTransaction(recipient, amount, bc, tp);
			server.broadcastTransaction(transaction);
			res.redirect('/transactions');
		});

		app.get('/balance', (req, res) => {
			const balance = new BigNumber(wallet.calculateBalance(bc, wallet.publicKey));
			res.json({ balance: balance.toFixed(2) }); // Enviamos el balance como string con 18 decimales
		});

		app.post('/start-mining', (req, res) => {
			miner.startMining();
			res.json({ status: 'Mining started' });
		});

		app.post('/stop-mining', (req, res) => {
			miner.stopMining();
			res.json({ status: 'Mining stopped' });
		});

		app.get('/transactions', (req, res) => {
			res.json(tp.transactions);
		});

		app.get('/blocks', (req, res) => {
			res.json(bc.chain);
		});

		app.post('/address-balance', (req, res) => {
			res.json(wallet.calculateBalance(bc, req.body.address));
		});

		app.get('/get-csrf-token', (req, res) => {
			res.json({ csrfToken: req.csrfToken() });
		});

		app.post('/network', (req, res) => {
			server.network = true;
			server.connectToPeers();
			res.json({ success: true });
		});

		app.get('/price', async (req, res) => {
			const now = Date.now();
			let cachedPrice = null;
			let lastFetchTime = 0;

			if(cachedPrice && (now - lastFetchTime < 60000)) {
				return res.json({price: cachedPrice});
			}
			
			try {
				const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=cop');				
				if(!response.ok) throw new Error(`Error en API: ${response.status}`);

				const data = await response.json();
				cachedPrice = data.usd.cop;
				lastFetchTime = now;

				res.json(cachedPrice);
			} catch (error) {
				res.status(500).json({ error: error.message });
			}
		});
		
		/*app.post('/add-item', (req, res) => {
			const { emoji, name, price, seller } = req.body;
			const item = st.addItem(emoji, name, price, seller);
			server.syncStore();
			res.json({ status: 'Item added', item });
		});

		app.post('/add-marketplace', (req, res) => {
			const { emoji, name, price, seller } = req.body;
			const item = st.addItemMarketPlace(emoji, name, price, seller);
			server.syncStore();
			res.json({ status: 'Item added', item });
		});

		app.get('/items', (req, res) => {
			res.json(st.items);
		});

		app.post('/buy-item', (req, res) => {
			const { id, amount } = req.body;
			try {
				const result = st.buyMarketPlace(id, amount, wallet, bc, tp, server);
				res.json(result);
			} catch (error) {
				res.status(400).json({ status: error.message });
			}
		});

		app.get('/wallets', (req, res) => {
			const wallets = walletManager.listWallets();
			res.status(200).json(wallets);
		});

		app.post('/wallets', (req, res) => {
			const newWallet = walletManager.newWallet();
			res.status(201).json(newWallet);
		});*/

		httpsServer.listen(HTTP_PORT, () => {
			console.log('HTTP server listening on port ' + HTTP_PORT);
		});

		server.listen();
		console.log('Server listen ok!');

		miner.mine();
		console.log('Miner start ok!');

	})
	.catch(error => {
		console.error('Failed to load wallet:', error.message);
		process.exit(1);
	});




/*
	//const express = require('express');
	const path = require('path');
	const https = require('https');
	const fs = require('fs');
	const helmet = require('helmet');
	const rateLimit = require('express-rate-limit');
	const csrf = require('csurf');
	const cookieParser = require('cookie-parser');
	
	//const Blockchain = require('./Blockchain');
	
	const P2pServer = require('./p2pServer');
	const HTTP_PORT = process.env.HTTP_PORT || 3001;
	const bodyParser = require('body-parser');
	//const Miner = require('./Miner');
	
	const bc = Blockchain.loadBlockchain();
	
	const BigNumber = require('bignumber.js');
	//const Wallet  = require('../Wallet/index');
	
	//const WalletManager = require('../Wallet/walletManager');
	//const TransactionPool = require('../Wallet/transactions-pool');
	//const StorePool = require('../Marketplace/index');
	//const qrCode = require('../Wallet/qr-code');
	
	//const loadedWalletManager = WalletManager.loadWallets();
	//const walletManager = WalletManager.fromJSON(loadedWalletManager);
	
	Wallet.loadWallet()
		.then(wallet => {
			console.log('Wallet successfully loaded:', wallet);
	
			const tp = new TransactionPool(bc);
			//const st = new StorePool();
			const p2pServer = new P2pServer(bc, tp); //storepool ,st
			const miner = new Miner(bc, tp, wallet, p2pServer);
			
			//const tx = wallet.publicKey;
			//const fp = './public/images/pk.png';
			//const QR = new qrCode(tx, fp);
			
			const app = express();
			
			app.use(helmet());
			
			const limiter = rateLimit({
				windowMs: 15 * 60 * 1000,
				max: 100,
			});
			
			app.use(limiter);
			
			app.use(cookieParser());
			
			app.use(bodyParser.urlencoded({ extended: false}));
			
			const csrfProtection = csrf({ cookie: true});
			app.use(csrfProtection);
			
			const privateKey = fs.readFileSync(path.resolve(__dirname, './public/localhost.key'), 'utf8');
			const certificate = fs.readFileSync(path.resolve(__dirname, './public/localhost.crt'), 'utf8');
			
			const credentials = {
				key: privateKey,
				cert: certificate,
				passphrase: 'xmrspacebanxx'
			};
			
			const httpsServer = https.createServer(credentials, app);
			
			app.use(express.static(path.join(__dirname, 'public')));
			app.use(bodyParser.json());
			
			app.use((req, res, next) => {
				res.header("Content-Security-Policy", "default-src 'self'; connect-src 'self' https://localhost:3001; script-src 'self' 'unsafe-inline';");
				res.header("Access-Control-Allow-Origin", "*");
				res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
				next();
			});
			
			app.get('/get-csrf-token', (req, res) => {
				res.json({ csrfToken: req.csrfToken() });
			});
			
			app.post('/network', (req, res) => {
				p2pServer.network = true;
				p2pServer.connectToPeers();
				res.json({ success: true });
			});
			
			app.get('/blocks', (req, res)=>{
				res.json(bc.chain);
			});
			
			app.get('/transactions',(req, res) => {
				res.json(tp.transactions);
			});
			
			app.post('/transact', (req, res) => {
				const { recipient, amount } = req.body;
				const transaction = wallet.createTransaction(recipient, new BigNumber(amount), bc, tp);
				p2pServer.broadcastTransaction(transaction);
				res.redirect('/transactions');
			});
			
			app.post('/start-mining', (req, res) => {
				miner.startMining();
				res.json({ status: 'Mining started' });
			});
			
			app.post('/stop-mining', (req, res) => {
				miner.stopMining();
				res.json({ status: 'Mining stopped' });
			});
			
			app.get('/public-key', (req, res) => {
				res.json(wallet.publicKey);
			});
			
			app.get('/balance', (req, res) => {
				res.json(wallet.calculateBalance(bc, wallet.publicKey));
			});
			
			app.post('/address-balance', (req, res) => {
				res.json(wallet.calculateBalance(bc, req.body.address));
			});
			/*
			app.post('/wallets', (req, res) => {
				const newWallet = walletManager.newWallet();
				res.status(201).json(newWallet);
			});
			
			app.get('/wallets', (req, res) => {
				const wallets = walletManager.listWallets();
				res.status(200).json(wallets);
			});
			
			app.post('/add-item', (req, res) => {
				const { emoji, name, price, seller } = req.body;
				const item = st.addItem(emoji, name, price, seller);
				p2pServer.syncStore();
				res.json({ status: 'Item added', item });
			});
			
			app.post('/add-marketplace', (req, res) => {
				const { emoji, name, price, seller } = req.body;
				const item = st.addItemMarketPlace(emoji, name, price, seller);
				p2pServer.syncStore();
				res.json({ status: 'Item added', item });
			});
			
			app.get('/items', (req, res) => {
				res.json(st.items);
			});
			
			app.post('/buy-item', (req, res) => {
				const { id, amount } = req.body;
				try {
					const result = st.buyMarketPlace(id, amount, wallet, bc, tp, p2pServer);
					res.json(result);
				} catch (error) {
					res.status(400).json({ status: error.message });
				}
			});
			
			httpsServer.listen(HTTP_PORT, ()=>{
				console.log('HTTP server listening on port ' + HTTP_PORT);
			});
			
			p2pServer.listen();

			miner.mine();
			
		})
		.catch(error => {
			console.error('Failed to load wallet:', error.message);
			// Manejar errores, por ejemplo, terminar el proceso
			process.exit(1);
		});


*/


//Oandresjuridicos1982@gmail.com
