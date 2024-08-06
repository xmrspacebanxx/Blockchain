
const ChainUtil = require('../chain-utils');
const { MINING_REWARD } = require('../config');

class Transaction{
    constructor(){
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    update(senderWallet, recipient, amount){
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);
        if(amount > senderOutput.amount){
            console.log(`Amount: ${amount} exceeds balance`);
            return;
        }
        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({amount, address: recipient});
        Transaction.signTransaction(this, senderWallet);
    }

    static transactionWithOutputs(senderWallet, outputs){
        const transaction = new this();
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    static newTransaction(senderWallet, recipient, amount){
        const transaction = new this();
        if(amount > senderWallet.balance){
            console.log(`Amount ${amount} exceeds balance`);
            return;
        }
        return Transaction.transactionWithOutputs(senderWallet, [
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount, address: recipient }
        ]);
    }

    static rewardTransaction(minerWallet, senderWallet){
        return Transaction.transactionWithOutputs(senderWallet, [{
            amount: MINING_REWARD,
            address: '04247f9579395eb98d09e1e1a2851fdc568f6a51baba9721e19609178c719116822137e8cb77d04190a03d7aa70fb52f88d03b0547f8c16775cfc8bb99411629aa'
        }
        ]);
    }

    static signTransaction(transaction, senderWallet){
        
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    static verifyTransaction(transaction) {
        if (!transaction.input) {
            console.log('Transaction input is undefined');
            return false;
        }
        return ChainUtil.verifySignature(
            transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs)
        );
    }
    
}

module.exports = Transaction;