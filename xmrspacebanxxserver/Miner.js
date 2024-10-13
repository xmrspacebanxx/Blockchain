
const { Worker } = require('worker_threads');
let { isMining, miningTimeout, numWorkers } = require('./config');
const { MINING_INTERVAL, TARGET_TIME } = require('./config');
const Transaction = require("./Transaction");

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
            //const rewardTransactions = Transaction.rewardOwnersOnMining(this.wallet);
            //validTransactions.push(...rewardTransactions);
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
                    this.stopAllWorkers();
					console.log('\x1b[32m%s\x1b[0m','Work finished...');
                    console.log(`New block added by worker: \nHash: ${block.hash} \nTime: ${new Date().toLocaleString()} \nDifficulty: ${block.difficulty} \nNonce: ${block.nonce} \nProcessTime: ${block.processTime}`);
                    this.blockchain.addBlock(block);
                    this.p2pServer.syncChains();
                    this.transactionPool.clearTransactions(transactions);
                    this.p2pServer.broadcastClearTransactions();
                    this.adjustWorkers(block.processTime);
                    this.intervalMining();
                } else {
                    console.log('Worker stopped mining as block was found by another worker.');
                }
            });
            worker.on('error', (error) => {
                console.error(`Worker error: ${error}`);
            });
            //worker.on('exit', (code) => {
            //    if (code !== 0) {
            //        console.error(`Worker stopped with exit code ${code}`);
            //    }
            //});
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

    adjustWorkers(processTime) {
        if (processTime > TARGET_TIME && numWorkers < 7) {
            numWorkers++;
            console.log('\x1b[35m%s\x1b[0m', `Number of workers equal to ${numWorkers}`);
        } else if (processTime < TARGET_TIME && numWorkers > 2) {
            numWorkers--;
            console.log(`Number of workers equal to ${numWorkers}`);
        } else {
            console.log('\x1b[36m%s\x1b[0m', `Number of workers equal to ${numWorkers}`);
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
