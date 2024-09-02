
const fs = require('fs');
const CryptoJS = require('crypto-js');
const path = require('path');
const { INITIAL_BALANCE } = require('../config');
const ChainUtil = require('../chain-utils');
const BigNumber = require('bignumber.js');
const readline = require('readline');

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

    saveWallet(password) {
        const directory = path.join(__dirname, '../../Backup');
        const filePath = path.join(directory, 'wallet.json');

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(this.toJSON()), password).toString();

        fs.writeFileSync(filePath, encrypted);
        console.log('Wallet saved and encrypted to disk.');
    }

    static loadWallet(password) {
        return new Promise((resolve, reject) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Enter your wallet password: ', (password) => {
                const filePath = path.join(__dirname, '../../Backup/wallet.json');
                try {
                    if (fs.existsSync(filePath)) {
                        const encryptedData = fs.readFileSync(filePath, 'utf-8');
                        const bytes = CryptoJS.AES.decrypt(encryptedData, password);
                        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                        if (!decrypted) throw new Error('Incorrect password or corrupted wallet file.');
                        const walletData = JSON.parse(decrypted);
                        console.log('Wallet decrypted and loaded from file...');
                        resolve(Wallet.fromJSON(walletData));
                    } else {
                        console.log('No existing wallet found, initializing new wallet...');
                        const wallet = new Wallet();
                        wallet.saveWallet(password);
                        resolve(wallet);
                    }
                } catch (error) {
                    console.error(error.message);
                    reject(error);
                } finally {
                    rl.close();
                }
            });
        });
    }
}

module.exports = Wallet;
