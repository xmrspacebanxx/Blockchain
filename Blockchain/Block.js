
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
        return new this('Space Exploration Genesis Time', '0'.repeat(64), '0'.repeat(64), [], 0, DIFFICULTY, 0);
    }

    static mineBlock(lastBlock, data){
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;
        let t1 = Date.now();
        do{
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = this.hash(timestamp, lastHash, data, nonce);
            // console.log(hash);
        } while (hash.substring(0, difficulty) != '0'.repeat(difficulty));
        let t2 = Date.now();
        let processTime = t2 - t1;
        return new this(timestamp, lastHash, hash, data, nonce, difficulty, processTime);
    }

    static hash(timestamp, lastHash, data, nonce, difficulty){
        return ChainUtil.hash(`${timestamp}${lastHash}${JSON.stringify(data)}${nonce}${difficulty}`).toString();
    }

    static blockHash(block){
        const {timestamp, lastHash, data, nonce, difficulty} = Block;
        return Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime){
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1: difficulty - 1;
        return difficulty;
    }

}

module.exports = Block;

