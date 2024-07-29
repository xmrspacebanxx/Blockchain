
let { isMining, miningTimeout } = require('../config');
const { MINING_INTERVAL } = require('../config');
const Transaction = require("../Wallet/transactions");
const Wallet = require('../Wallet/index');


class Miner{
    constructor(blockchain, transactionPool, wallet, p2pServer){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine(){
        if(isMining) {
            const validTransactions = this.transactionPool.validTransactions();
            //include a reward for the miner
            validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
            //create a block consisting of the valids transactions
            const block = this.blockchain.addBlock(validTransactions);
            console.log(`New block added: ${block.toString()}`);
            //synchronize the chains in the peep to peer server
            this.p2pServer.syncChains();
            //clear the transactions pool
            this.transactionPool.clear();
            //broadcast to every miner to clear the transactions pool
            this.p2pServer.broadcastClearTransactions();
            //interval mining
            this.intervalMining();
            return block;    
        }
    }
    startMining() {
        if(!isMining) {
            isMining = true;
            this.mine();
            console.log('Mining started');
        }
    }
    stopMining() {
        clearTimeout(miningTimeout);
        isMining = false;
        console.log('Mining stopped');
    }
    intervalMining() {
        miningTimeout = setTimeout(() => {
            this.mine();
        }, MINING_INTERVAL);
    }
}

module.exports = Miner;