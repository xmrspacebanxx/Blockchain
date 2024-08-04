
const { parentPort, workerData } = require('worker_threads');
const Block = require('./Blockchain/Block');

// Desestructurar los datos enviados al worker
const { lastBlock, transactions, nonceStart, nonceEnd, controlFlag } = workerData;

Block.mineBlock(lastBlock, transactions, nonceStart, nonceEnd, controlFlag);

// Enviar el bloque minado de vuelta al hilo principal