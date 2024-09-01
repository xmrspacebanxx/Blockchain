
const Transaction = require('../Wallet/transactions');
const Wallet = require('../Wallet/index');
const BigNumber = require('bignumber.js');

class TransactionPool{
	constructor(blockchain){
		this.transactions = [];
		this.blockchain = blockchain;
	}

	updateAddTransaction(transaction){
		if(!transaction || !transaction.id){
			console.warn('Invalid transaction detected and discarded');
			return;
		}
		let transactionWithId = this.transactions.find(t => t && t.id === transaction.id);
		if(transactionWithId){
			this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
		} else{
			this.transactions.push(transaction);
		}
	}

	existingTransaction(address){
		return this.transactions.find(t => t && t.input && t.input.address === address);
	}

	validTransactions(){
		return this.transactions.filter(transaction => {
			const outputTotal = transaction.outputs.reduce((total, output) => {
				return new BigNumber(total).plus(new BigNumber(output.amount));
            }, new BigNumber(0));
			if(!new BigNumber(transaction.input.amount).isEqualTo(outputTotal)){
				console.log(`Invalid transaction from ${transaction.input.address}`);
				return false;
			}
			if(!Transaction.verifyTransaction(transaction)){
				console.log(`Invalid signature from ${transaction.input.address}`);
				return false;
			}
			const wallet = new Wallet();
			const balance = wallet.calculateBalance(this.blockchain, transaction.input.address);
			if(new BigNumber(transaction.input.amount).isGreaterThan(balance)){
				console.log(`Insufficient balance for transaction from ${transaction.input.address}`);
				return false;
			}
			return true;
		});
	}

	clear(){
		this.transactions = [];
	}

	clearTransactions(transactions){
		this.transactions = this.transactions.filter(t => !transactions.find(tx => tx.id === t.id));
	}

}

module.exports = TransactionPool;

