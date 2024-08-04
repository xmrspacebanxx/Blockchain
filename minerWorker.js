
const { parentPort, workerData } = require('worker_threads');
const Block = require('./Blockchain/Block');

// Desestructurar los datos enviados al worker
const { lastBlock, transactions, controlFlag } = workerData;

const block = Block.mineBlock(lastBlock, transactions, controlFlag);

// Enviar el bloque minado de vuelta al hilo principal
parentPort.postMessage(block);
