
const ChainUtil = require('./ChainUtil');
const {DIFFICULTY, MINE_RATE} = require('./config');

class Block {

    constructor(timestamp, lastHash, hash, data, nonce, difficulty, processTime = 0) {
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
        const timestamp = '1728806400000';
        const lastHash = '0'.repeat(64);
        const nonce = 0;
        const difficulty = DIFFICULTY;
        const data = [];
        const hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        return new this(timestamp, lastHash, hash, data, nonce, difficulty, 0);
    }


    static mineBlock(lastBlock, data, nonceStart, nonceEnd, controlFlag) {
        return new Promise((resolve, reject) => {
            try {
                let hash, timestamp;
                const lastHash = lastBlock.hash;
                let difficulty = lastBlock.difficulty;
                let nonce = nonceStart;
                let t1 = Date.now();
                do {
                    if (controlFlag.found) {
                        resolve(null);
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
                const block = new this(timestamp, lastHash, hash, data, nonce, difficulty, processTime);
                resolve(block);
            } catch (error) {
                reject(error);
            }
        });
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
        return Math.max(difficulty, 1);
    }
}

module.exports = Block;
