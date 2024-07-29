
const Transaction = require('../Wallet/transactions');
const Wallet = require('../Wallet/index');

class TransactionPool{
    constructor(blockchain){
        this.transactions = [];
        this.blockchain = blockchain;
    }

    updateAddTransaction(transaction){
        let transactionWithId = this.transactions.find(t => t && t.id === transaction.id);
        if(transactionWithId){
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }

    existingTransaction(address){
        return this.transactions.find(t => t && t.input && t.input.address === address);  
    }

    validTransactions() {
        return this.transactions.filter(transaction => {
            const outputTotal = transaction.outputs.reduce((total, output) => {
                return total + output.amount;
            }, 0);
            if (transaction.input.amount !== outputTotal) {
                console.log(`Invalid transaction from ${transaction.input.address}`);
                return false;
            }
            if (!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}`);
                return false;
            }

            // Verificación del balance
            const wallet = new Wallet();
            const balance = wallet.calculateBalance(this.blockchain, transaction.input.address);
            if (transaction.input.amount > balance) {
                console.log(`Insufficient balance for transaction from ${transaction.input.address}`);
                return false;
            }
            return true;
        });
    }

    clear(){
        this.transactions = [];
    }
}

module.exports = TransactionPool;