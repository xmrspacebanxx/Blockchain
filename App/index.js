
const express = require('express');
const fs = require('fs');

const Blockchain = require('../Blockchain/index');

const P2pServer = require('./p2pServer');
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const bodyParser = require('body-parser');
const Miner = require('../App/miner');

const app = express();
const bc = new Blockchain();

const Wallet = require('../Wallet/index');
const TransactionPool = require('../Wallet/transactions-pool');
const StorePool = require('../Marketplace/index');
const qrCode = require('../Wallet/qr-code');

const wallet = new Wallet();
const tp = new TransactionPool(bc);
const st = new StorePool();
const p2pServer = new P2pServer(bc, tp, st);
const miner = new Miner(bc, tp, wallet, p2pServer);

const tx = wallet.publicKey;
const fp = './App/public/images/pk.png';
const QR = new qrCode(tx, fp);


app.use(bodyParser.json());

// Middleware para permitir CORS (necesario para desarrollo local)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/blocks', (req, res)=>{
    res.json(bc.chain);
});

// Function to load blockchain from file
function loadBlockchain() {
    if (fs.existsSync('blockchain.json')) {
        const data = fs.readFileSync('blockchain.json');
        const chainData = JSON.parse(data);
        bc.replaceChain(chainData);
    }
}

// Function to save blockchain to file
function saveBlockchain() {
    fs.writeFileSync('blockchain.json', JSON.stringify(bc.chain, null, 2));
}

// Load blockchain initially
loadBlockchain();

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);
    p2pServer.syncChains();
    res.redirect('/blocks');
});

app.get('/transactions',(req, res) => {
    res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, bc, tp);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.post('/miner-transactions', (req, res) => {
    const block = miner.mine();
    console.log(`Addeed new block ${block}`);
    saveBlockchain();
    res.redirect('/blocks');
});

// Routes for mining control
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

// Route to add an item to the pool
app.post('/add-item', (req, res) => {
    const { emoji, name, price, seller } = req.body;
    const item = st.addItem(emoji, name, price, seller);
    p2pServer.syncStore();
    res.json({ status: 'Item added', item });
});

// Route to get all items
app.get('/items', (req, res) => {
    res.json(st.items); // Usa la instancia de StorePool
});

// Route to buy an item
app.post('/buy-item', (req, res) => {
    const { id, amount } = req.body;
    try {
        const result = st.buyItem(id, amount, wallet, bc, tp, p2pServer); // Usa la instancia de StorePool
        res.json(result);
    } catch (error) {
        res.status(400).json({ status: error.message });
    }
});

// Network
app.post('/network', (req, res) => {
    p2pServer.network = true;
    p2pServer.connectToPeers();
    res.json({ success: true });
});

app.get('/status', (req, res) => {
    const connected = p2pServer.length > 0;
    res.json({ connected });
})

// Route to get items in wallet
app.get('/wallet-items', (req, res) => {
    // Return items in the wallet (implement this logic)
    res.json([]);
});

app.listen(HTTP_PORT, ()=>{
    console.log('HTTP server listening on port ' + HTTP_PORT);
});

p2pServer.listen();



/*  Agregar nodo (escribir en consola)
    set peers=ws://localhost:5001
    set P2P_PORT=5002
    set HTTP_PORT=3001

    npm run dev
*/

/*  Moneda de reserva: par 1 a 1 dolar us
    Utilidad diaria
    

*/