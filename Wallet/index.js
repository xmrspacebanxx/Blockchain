
const fs = require('fs');
const { INITIAL_BALANCE }  = require('../config');
const ChainUtil = require('../chain-utils');
const Transaction = require('./transactions');

class Wallet{
    constructor(){
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString(){
        return `wallet
        publicKey: ${this.publicKey}
        balance: ${this.balance}`
    }

    sign(datahash){
        return this.keyPair.sign(datahash);
    }

    privateKey(){
        return this.keyPair.getPrivate();
    }

    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain, this.publicKey);
        if (amount > this.balance) {
            console.log(`Amount ${amount} exceeds balance ${this.balance}`);
            return;
        }
        let transaction = transactionPool.existingTransaction(this.publicKey);
        if (transaction) {
            transaction.update(this, recipient, amount);
        } else {
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateAddTransaction(transaction);
        }
        return transaction;
    }    

    calculateBalance(blockchain, address) {
        let balance = 0; // Empezamos con balance en 0 en vez de this.balance
        let transactions = [];
        
        // Revisar todas las transacciones en la blockchain
        blockchain.chain.forEach(block => {
            block.data.forEach(transaction => {
                transactions.push(transaction);
            });
        });
    
        // Filtrar las transacciones donde la dirección de input es la de la wallet
        const walletInputs = transactions.filter(transaction => transaction.input.address === address);
        let startTime = 0;
        
        if (walletInputs.length > 0) {
            // Encontrar la transacción de input más reciente
            const recentInput = walletInputs.reduce((prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current);
            const recentOutput = recentInput.outputs.find(output => output.address === address);
            if (recentOutput) {
                balance = recentOutput.amount;
                startTime = recentInput.input.timestamp;
            }
        }
    
        // Añadir las salidas desde la transacción más reciente en adelante
        transactions.forEach(transaction => {
            if (transaction.input.timestamp > startTime) {
                transaction.outputs.forEach(output => {
                    if (output.address === address) {
                        balance += output.amount; // Añadir el monto recibido
                    }
                    if (transaction.input.address === address) {
                        balance -= output.amount; // Restar el monto enviado
                    }
                });
            }
        });
        
        return balance;
    }
    

    // Method to serialize wallet to JSON
    toJSON() {
        return {
            balance: this.balance,
            keyPair: {
                public: this.keyPair.getPublic().encode('hex'),
                private: this.keyPair.getPrivate().toString(16)
            },
            publicKey: this.publicKey
        };
    }
    
    // Method to deserialize wallet from JSON
    static fromJSON(data) {
        const wallet = new Wallet();
        wallet.balance = data.balance;
        wallet.keyPair = ChainUtil.genKeyPair(data.keyPair);
        wallet.publicKey = data.publicKey;
        return wallet;
    }

    // Function to save wallet to file
    saveWallet(wallet) {
        fs.writeFileSync('./Wallet/wallet.json', JSON.stringify(wallet.toJSON(), null, 2));
    }

    // Function to load wallet from file
    static loadWallet() {
        if (fs.existsSync('./Wallet/wallet.json')) {
            const data = fs.readFileSync('./Wallet/wallet.json');
            const walletData = JSON.parse(data);
            return Wallet.fromJSON(walletData);
        } else {
            const wallet = new Wallet();
            wallet.saveWallet(wallet);
            return wallet;
        }
    }
    
}

module.exports = Wallet;

