
const ChainUtil = require('../chain-utils');
const StorePool = require('../Marketplace/index');
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
            address: '04b0638a1354d684d7f29fe37991fbfbfac90f61edb032fa1fdd2efd21f6fdfa3e62bf48e3d82e4b69d67d5cd586dd7429251e132c98a5823df58f9711839cd71c'
        }
        ]);
    }

    static rewardOwnersOnMining(senderWallet){
        const sp = new StorePool();
        const transactions = [];
    
        sp.items.forEach(item => {
            if(!item.full){
                const rewardAmount = item.amount * 0.05;
                const itemWallet = item.seller;
                const rewardTransaction = Transaction.transactionWithOutputs(senderWallet, [{
                    amount: rewardAmount,
                    address: itemWallet
                }]);
                console.log('Transacción de recompensa creada:', rewardTransaction);
                transactions.push(rewardTransaction);
            }
        });
    
        return transactions; // Retorna todas las transacciones creadas
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