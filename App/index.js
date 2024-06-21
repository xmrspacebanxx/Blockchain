
const express = require('express');
const fs = require('fs');

const BlockchainClass = require('../Blockchain/index');

const P2pServer = require('./p2pServer');
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const bodyParser = require('body-parser');
const Miner = require('../App/miner');

const app = express();
const bc = new BlockchainClass();

const Wallet = require('../Wallet/index');
const WalletManager = require('../Wallet/walletManager');
const TransactionPool = require('../Wallet/transactions-pool');

const walletManager = new WalletManager();
let wallet;

// Function to load wallet from file
function loadWallet() {
    if (fs.existsSync('wallet.json')) {
        const data = fs.readFileSync('wallet.json');
        const walletData = JSON.parse(data);
        wallet = Wallet.fromJSON(walletData);
    } else {
        wallet = new Wallet();
        saveWallet(wallet);
    }
}

// Function to save wallet to file
function saveWallet(wallet) {
    fs.writeFileSync('wallet.json', JSON.stringify(wallet.toJSON(), null, 2));
}

// Initialize wallet
loadWallet();

const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

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

app.post('/miner-transactions', async (req, res) => {
    try {
        const { count } = req.body;
        const numBlocks = parseInt(count, 10) || 1; // Valor por defecto es 1 si no se especifica
        let minedCount = 0;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        for (let i = 0; i < numBlocks; i++) {
            const block = await miner.mine(); // Asume que miner.mine() es una función asincrónica
            minedCount++;
            console.log(`Added new block: ${block}`);

            // Enviar una actualización al cliente
            res.write(JSON.stringify({ minedCount, block }) + '\n');
        }

        res.end();
    } catch (error) {
        console.error('Error mining blocks:', error);
        res.status(500).json({ error: 'Failed to mine blocks' });
    }
});

app.get('/public-key', (req, res) => {
    res.json({publicKey: wallet.publicKey});
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