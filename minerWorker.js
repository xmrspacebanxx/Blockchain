
const { parentPort, workerData } = require('worker_threads');
const Block = require('./Blockchain/Block');

// Desestructurar los datos enviados al worker
const { lastBlock, transactions, nonceStart, nonceEnd, controlFlag } = workerData;

Block.mineBlock(lastBlock, transactions, nonceStart, nonceEnd, controlFlag)
    .then(block => {
        parentPort.postMessage({ block, transactions });
    })
    .catch(err => {
        parentPort.postMessage(null);
    });
