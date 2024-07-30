
class Block {

    constructor(timestamp, lastHash, hash, data, nonce, difficulty, processTime) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
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
        return new this('Genesis TIme', '0'.repeat(64), '0'.repeat(64), [], 0, 3, 0);
    }

}

module.exports = Block;

