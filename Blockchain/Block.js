
const { parentPort } = require('worker_threads');
const ChainUtil = require('../chain-utils');
const {DIFFICULTY, MINE_RATE} = require('../config');


class Block {

    constructor(timestamp, lastHash, hash, data, nonce, difficulty, processTime) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
        this.processTime = processTime;

    }

    toString() {
        return `
                Timestamp: ${this.timestamp}
                Last Hash: ${this.lastHash}
                Hash: ${this.hash}
                Data: ${this.data}
                Nonce: ${this.nonce}
                Difficulty: ${this.difficulty}
                Process Time: ${this.processTime}`;
    }

    static genesis(){
        const timestamp = 'Space Exploration Genesis Time';
        const lastHash = '0'.repeat(64);
        const nonce = 0;
        const difficulty = DIFFICULTY;
        const data = [];
        const hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        return new this(timestamp, lastHash, '0'.repeat(difficulty) + hash.substring(difficulty), data, nonce, difficulty, 0);
    }

    static mineBlock(lastBlock, data, nonceStart, nonceEnd, controlFlag) {
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = nonceStart;
        let t1 = Date.now();

        do {
            // Verificar si se ha encontrado un bloque válido
            if (controlFlag.found) {
                parentPort.postMessage(null);
                return;
            }
            nonce++;
            if (nonce > nonceEnd) {
                nonce = nonceStart;
            }
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = this.hash(timestamp, lastHash, data, nonce, difficulty);

        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        let t2 = Date.now();
        let processTime = t2 - t1;
        controlFlag.found = true;

        const block = new this(timestamp, lastHash, '0'.repeat(difficulty) + hash.substring(difficulty), data, nonce, difficulty, processTime);
        parentPort.postMessage({ block, transactions: data });
    }

    static hash(timestamp, lastHash, data, nonce, difficulty){
        return ChainUtil.hash(`${timestamp}${lastHash}${JSON.stringify(data)}${nonce}${difficulty}`).toString();
    }

    static blockHash(block) {
        const { timestamp, lastHash, data, nonce, difficulty } = block;
        const hash = this.hash(timestamp, lastHash, data, nonce, difficulty);
        return '0'.repeat(difficulty) + hash.substring(difficulty);
    }
    
    static adjustDifficulty(lastBlock, currentTime){
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1: difficulty - 1;
        return Math.max(difficulty, 6);
    }

}

module.exports = Block;

