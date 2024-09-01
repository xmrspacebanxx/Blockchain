
const fs = require('fs');
const path = require('path');
const { INITIAL_BALANCE } = require('../config');
const ChainUtil = require('../chain-utils');
const BigNumber = require('bignumber.js');

class Wallet{
	constructor(){
		this.balance = new BigNumber(INITIAL_BALANCE);
		this.keyPair = ChainUtil.genKeyPair();
		this.publicKey = this.keyPair.getPublic().encode('hex');
	}

	toString(){
		return `wallet
		publicKey: ${this.publicKey}`
	}

    sign(datahash){
        return this.keyPair.sign(datahash);
    }

	privateKey(){
		return this.keyPair.getPrivate();
	}

    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain, this.publicKey);
        if (amount.isGreaterThan(this.balance)) {
            console.log(`Amount ${amount} exceeds balance ${this.balance}`);
            return;
        }
		if(recipient === this.publicKey){
			console.log(`Invalid transaction from ${this.publicKey}`);
			return;
		}
        let transaction = transactionPool.existingTransaction(this.publicKey);
        if (transaction) {
            transaction.update(this, recipient, amount);
        } else {
			const Transaction = require('./transactions');
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateAddTransaction(transaction);
        }
        return transaction;
    } 
	
	calculateBalance(blockchain, address){
		let balance = new BigNumber(0);
		let transactions = [];
		blockchain.chain.forEach(block => {
			block.data.forEach(transaction => {
				transactions.push(transaction);
			});
		});
		const walletInputs = transactions.filter(transaction => transaction.input.address == address);
		let startTime= 0;
		if(walletInputs.length > 0){
			const recentInput = walletInputs.reduce((prev, current) => prev.input.timestamp > 
				current.input.timestamp ? prev : current);
			const recentOutput = recentInput.outputs.find(output => output.address === address);
			if(recentOutput){
				balance = new BigNumber(recentOutput.amount);
				startTime = recentInput.input.timestamp;
			}
		}
		transactions.forEach(transaction => {
			if(transaction.input.timestamp > startTime){
				transaction.outputs.forEach(output => {
					if(output.address === address){
						balance = balance.plus(output.amount);
					}
					if(transaction.input.address === address){
						balance = balance.minus(output.amount);

					}
				});
			}
		});
		return balance;
	}

	toJSON(){
		return{
			balance: this.balance.toString(),
			keyPair: {
				public: this.keyPair.getPublic().encode('hex'),
				private: this.keyPair.getPrivate().toString(16)
			},
			publicKey: this.publicKey
		};
	}

	static fromJSON(data){
		const wallet = new Wallet();
		wallet.balance = new BigNumber(data.balance);
		wallet.keyPair = ChainUtil.restoreKeyPair(data.keyPair.private);
		wallet.publicKey = data.publicKey;
		return wallet;
	}

	saveWallet(){
        const directory = path.join(__dirname, '../Wallet');
        const filePath = path.join(directory, 'wallet.json');
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(this.toJSON(), null, 2));
        console.log('Wallet saved to disk.');
	}

	static loadWallet(){
        const filePath = path.join(__dirname, '../Wallet/wallet.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath);
            const walletData = JSON.parse(data);
            console.log('Loaded wallet from file...');
            return walletData;
        } else{
            console.log('No existing wallet found, initializing new wallet...');
            const wallet = new Wallet();
            wallet.saveWallet();
            return wallet;
        }
	}

}

module.exports = Wallet;




