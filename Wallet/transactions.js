
const ChainUtil = require('../chain-utils');
const StorePool = require('../Marketplace/index');
const BigNumber = require('bignumber.js');
const { MINING_REWARD, DIFFICULTY } = require('../config');

class Transaction{
    constructor(){
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    update(senderWallet, recipient, amount){
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);
        amount = new BigNumber(amount);
        if(amount.isGreaterThan(senderOutput.amount)){
            console.log(`Amount: ${amount} exceeds balance`);
            return;
        }
		if(senderWallet.publicKey === recipient){
			console.log(`Invalid transaction from ${senderWallet.publicKey}`);
			return;
		}
        senderOutput.amount = new BigNumber(senderOutput.amount).minus(amount);;
        this.outputs.push({amount, address: recipient});
        Transaction.signTransaction(this, senderWallet);
    }

    static transactionWithOutputs(senderWallet, outputs){
        const transaction = new this();
        transaction.outputs.push(...outputs.map(output => ({
            ...output,
            amount: new BigNumber(output.amount).toString()
        })));
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    static newTransaction(senderWallet, recipient, amount){
        amount = new BigNumber(amount);
        if(amount.isGreaterThan(senderWallet.balance)){
            console.log(`Amount ${amount} exceeds balance`);
            return;
        }
		if(senderWallet.publicKey === recipient){
			console.log(`Invalid transaction from ${senderWallet.publicKey}`);
			return;
		}
        return Transaction.transactionWithOutputs(senderWallet, [
            { amount: senderWallet.balance.minus(amount).toString(), address: senderWallet.publicKey },
            { amount: amount.toString(), address: recipient }
        ]);
    }

    static rewardTransaction(minerWallet, senderWallet) {
        return Transaction.transactionWithOutputs(senderWallet, [{
            amount: new BigNumber(MINING_REWARD).toString(),
            address: '041b34e837a6a49bad034ca0d7c551fa8a13e7c580cf39f5599c8ae73ee7cd17fac538dc719ff0b7ba2df0570170730604c7a3ba96f4a79f76730a3dfea1cd7165'
        }]);
    }

    // static rewardOwnersOnMining(senderWallet){
    //     const sp = new StorePool();
    //     const transactions = [];
    //     sp.items.forEach(item => {
    //         if(!item.full){
    //             const rewardAmount = item.amount * DIFFICULTY;
    //             const itemWallet = item.seller;
    //             const rewardTransaction = Transaction.transactionWithOutputs(senderWallet, [{
    //                 amount: rewardAmount,
    //                 address: itemWallet
    //             }]);
    //             console.log('Transacción de recompensa creada:', rewardTransaction);
    //             transactions.push(rewardTransaction);
    //         }
    //     });    
    //     return transactions;
    // }

    static signTransaction(transaction, senderWallet){
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance.toString(),
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

