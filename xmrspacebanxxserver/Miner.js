
const { Worker } = require('worker_threads');
let { difficulty, isMining, miningTimeout, numWorkers } = require('./config');
const { MINING_INTERVAL, TARGET_TIME, amountBlocks, minWorkers, maxWorkers } = require('./config');
const Transaction = require("./Transaction");
const { exec } = require('child_process');


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
        const indexBlock = this.blockchain.getBlockIndex();
        const nonceRange = Math.pow(2, 32) / numWorkers;
        this.workers = this.createWorkers(numWorkers, lastBlock, transactions, nonceRange);
        this.workers.forEach((worker, index) => {
            worker.on('message', (message) => {
                if (message) {
                    this.stopAllWorkers();
                    const { block, transactions } = message;
                    this.transactionPool.discardInvalidTransactions();
                    const blockAdded = this.blockchain.addBlock(block);
                    if(blockAdded){
                        //exec('play -n synth 0.1 saw 440');
                        console.log(`New block added by worker ${index}: \nLastHash: ${block.lastHash}  \nHash: ${block.hash} \nTime: ${new Date().toLocaleString()} \nDifficulty: ${block.difficulty} \nNonce: ${block.nonce} \nProcessTime: ${block.processTime}`);
                        this.p2pServer.syncChains();
                        this.transactionPool.clearTransactions(transactions);
                        this.p2pServer.broadcastClearTransactions();
                        this.adjustWorkers(block.processTime);
                        this.blockchain.saveBlockchain();
                        console.log('\x1b[32m%s\x1b[0m','Work finished...');
                        if ( amountBlocks === indexBlock) {
                            this.stopMining();
                        } else {
                            this.intervalMining();
                        }
                    } else {
                        this.mine();
                    }
                } else {
                    console.log('Worker stopped mining as block was found by another worker.');
                }
            });
            worker.on('error', (error) => {
                console.error(`Worker error: ${error}`);
            });
            worker.on('exit', (code) => {
                if (code !== 0) {
            //        console.error(`Worker stopped with exit code ${code}`);
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

    adjustWorkers(processTime) {
        if (processTime > TARGET_TIME && numWorkers < maxWorkers) {
            numWorkers++;
            console.log('\x1b[35m%s\x1b[0m', `Number of workers equal to ${numWorkers}`);
        } else if (processTime < TARGET_TIME && numWorkers > minWorkers) {
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
