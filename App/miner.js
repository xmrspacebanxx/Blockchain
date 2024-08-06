
const { Worker } = require('worker_threads');
let { isMining, miningTimeout, numWorkers } = require('../config');
const { MINING_INTERVAL, TARGET_TIME } = require('../config');
const { saveBlockchain } = require('../Blockchain/index');
const Transaction = require("../Wallet/transactions");

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
        this.controlFlag = { found: false };
        this.workers = [];
    }

    mine() {
        if (isMining) {
            const validTransactions = this.transactionPool.validTransactions();
            validTransactions.push(Transaction.rewardTransaction(this.wallet, this.wallet));
            this.mining(validTransactions);
        }
    }

    mining(transactions) {
        const lastBlock = this.blockchain.getLastBlock();
        const nonceRange = Math.pow(2, 32) / numWorkers;

        this.workers = this.createWorkers(numWorkers, lastBlock, transactions, nonceRange);

        this.workers.forEach((worker) => {
            worker.on('message', (message) => {
                if (message) {
                    const { block, transactions } = message;
                    console.log(`New block added by worker: ${block.toString()}`);
                    this.blockchain.chain.push(block);
                    this.blockchain.saveBlockchain();
                    this.p2pServer.syncChains();
                    this.transactionPool.clearTransactions(transactions);
                    this.p2pServer.broadcastClearTransactions();
                    this.stopAllWorkers();
                    this.adjustWorkers(block.processTime);
                    this.intervalMining();
                } else {
                    console.log('Worker stopped mining as block was found by another worker.');
                }
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

    createWorkers(num, lastBlock, transactions, nonceRange) {
        const workers = [];
        for (let i = 0; i < num; i++) {
            const nonceStart = Math.floor(i * nonceRange);
            const nonceEnd = Math.floor((i + 1) * nonceRange);

            workers.push(new Worker('./minerWorker.js', {
                workerData: { lastBlock, transactions, nonceStart, nonceEnd, controlFlag: this.controlFlag }
            }));
        }
        return workers;
    }

    stopAllWorkers() {
        this.workers.forEach(worker => worker.terminate());
        this.controlFlag.found = false;
    }

    adjustWorkers(processTime) {processTime < TARGET_TIME && numWorkers > 1
        if (processTime < TARGET_TIME && numWorkers == 4) {
            numWorkers == 4;
            console.log(`Number of workers equal to 4`);

        } else if (processTime < TARGET_TIME && numWorkers < 11) {
            numWorkers--;
            console.log(`Decreasing number of workers to ${numWorkers}`);
        }  else if (processTime > TARGET_TIME && numWorkers >= 4) {
            numWorkers++;
            console.log(`Increasing number of workers to ${numWorkers}`);
        }

    }

    startMining() {
        if (!isMining) {
            isMining = true;
            this.mine();
            console.log('Mining started');
        }
    }

    stopMining() {
        if (isMining) {
            isMining = false;
            clearTimeout(miningTimeout);
            this.stopAllWorkers(this.workers);
            console.log('Mining stopped');
        }
    }

    intervalMining() {
        miningTimeout = setTimeout(() => {
            this.mine();
        }, MINING_INTERVAL);
    }
}

module.exports = Miner;
