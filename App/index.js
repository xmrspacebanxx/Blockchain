
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const Blockchain = require('../Blockchain/index');

const P2pServer = require('./p2pServer');
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const bodyParser = require('body-parser');
const Miner = require('../App/miner');

const bc = Blockchain.loadBlockchain();

const BigNumber = require('bignumber.js');
const Wallet  = require('../Wallet/index');
const WalletManager = require('../Wallet/walletManager');
const TransactionPool = require('../Wallet/transactions-pool');
const StorePool = require('../Marketplace/index');
const qrCode = require('../Wallet/qr-code');

const loadedWalletManager = WalletManager.loadWallets();
const walletManager = WalletManager.fromJSON(loadedWalletManager);

const loadedWalletData = Wallet.loadWallet();
const wallet = Wallet.fromJSON(loadedWalletData);

const tp = new TransactionPool(bc);
const st = new StorePool();
const p2pServer = new P2pServer(bc, tp, st);
const miner = new Miner(bc, tp, wallet, p2pServer);

const tx = wallet.publicKey;
const fp = './App/public/images/pk.png';
const QR = new qrCode(tx, fp);

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

const privateKey = fs.readFileSync(path.resolve(__dirname, './certs/localhost.key'), 'utf8');
const certificate = fs.readFileSync(path.resolve(__dirname, './certs/localhost.crt'), 'utf8');

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

