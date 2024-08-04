
const { Worker } = require('worker_threads');
let { isMining, miningTimeout, numWorkers } = require('../config');
const { MINING_INTERVAL, TARGET_TIME } = require('../config');
const Transaction = require("../Wallet/transactions");
const Wallet = require('../Wallet/index');


class Miner{
    constructor(blockchain, transactionPool, wallet, p2pServer){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
        this.controlFlag = { found: false };
    }

    mine() {
        if (isMining) {
            const validTransactions = this.transactionPool.validTransactions();
            //include a reward for the miner
            validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
            //create a block consisting of the valids transactions
            this.mining(validTransactions);
        }
    }

    mining(transactions) {
        const lastBlock = this.blockchain.getLastBlock();
        const workers = this.createWorkers(numWorkers, lastBlock, transactions);
        workers.forEach(worker => {
            worker.on('message', (block) => {
                if(block) {
                    console.log(`New block added by worker: ${block.toString()}`);
                    this.blockchain.chain.push(block);
                    this.p2pServer.syncChains();
                    this.transactionPool.clear();
                    this.p2pServer.broadcastClearTransactions();
                    this.adjustWorkers();
                    this.intervalMining();    
                } else {
                    console.log('Worker stopped mining as block was found by another worker.');
                }
                this.stopWorkers(workers);
            });

            worker.on('error', (error) => {
                console.error(`Worker error: ${error}`);
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker stopped with exit code ${code}`);
                }
            });
        });
    }

    createWorkers(num, lastBlock, transactions, controlFlag) {
        const workers = [];
        for (let i = 0; i < num; i++) {
            workers.push(new Worker('./minerWorker.js', {
                workerData: { lastBlock, transactions, controlFlag }
            }));
        }
        return workers;
    }

    stopWorkers(workers) {
        workers.forEach(worker => worker.terminate());
        this.controlFlag.found = false;
    }

    adjustWorkers() {
        const processTime = this.blockchain.getLastBlock().processTime;
        if (processTime > TARGET_TIME) {
            numWorkers++;
            console.log(`Increasing number of workers to ${numWorkers}`);
        } else if (processTime < TARGET_TIME && numWorkers > 1) {
            numWorkers--;
            console.log(`Decreasing number of workers to ${numWorkers}`);
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