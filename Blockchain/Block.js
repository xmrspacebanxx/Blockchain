
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

    static hash(timestamp, lastHash, data, nonce, difficulty){
        return ChainUtil.hash(`${timestamp}${lastHash}${JSON.stringify(data)}${nonce}${difficulty}`).toString();
    }

    static blockHash(block) {
        const { timestamp, lastHash, data, nonce, difficulty } = block;
        const hash = this.hash(timestamp, lastHash, data, nonce, difficulty);
        return '0'.repeat(difficulty) + hash.substring(difficulty);
    }
    

}

module.exports = Block;

