
const Wallet = require('./index');
const Transaction = require('./transactions');
const TransactionPool = require('./transactions-pool');
const BlockchainClass = require('../Blockchain');

// const myWallet = new wallet();
// const recipient = 'dafsdfas';
// const amount = 200000;
// console.log(myWallet.tostring());

// const tx = Transaction.newTransaction(myWallet, recipient, amount);
// console.log(tx);

const w1 = new Wallet();
const w2 = new Wallet();
const amount = 100000;

const tp = new TransactionPool();
const bc = new BlockchainClass();

const tx = w1.createTransaction('fasgfdhsthsasg', 100, bc, tp);

// tx.update(w1, w2.publicKey, 200000);
// tx.update(w1, w2.publicKey, 300000);
// tx.update(w1, w2.publicKey, 10000);
// tp.updateOrAddTransaction(tx);

console.log(tx.outputs);

const txx = Transaction.rewardTransaction(w1, Wallet.blockchainWallet());
console.log(txx.outputs.find(output => output.address === w1.publicKey).amount);
// console.log(tp.transactions.find(t=>t.id === tx.id) === tx);

const tx2 = w2.createTransaction('kiyujkhgghfgh', 250, bc, tp);
// tp.updateOrAddTransaction(tx2);
console.log(tx2.outputs);
// console.log(tp.transactions.find(t=>t.id === tx2.id) === tx2);


console.log('Transaction verify is ' + Transaction.verifyTransaction(tx));
console.log('Transaction verify is ' + Transaction.verifyTransaction(tx2));

console.log('The balances is ' + Wallet.calculateBalance(bc, w1));