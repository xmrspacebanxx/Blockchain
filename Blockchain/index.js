
const fs = require('fs');
const path = require('path');
const Block = require('./Block');

class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
    }

    getLastBlock(){
        return this.chain[this.chain.length -1];
    }

    addBlock(block){
        this.chain.push(block);
        this.saveBlockchain();
    }

    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            console.log('Genesis block does not match');
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];

            if (block.lastHash !== lastBlock.hash) {
                console.log(`Invalid lastHash at block ${i}`);
                return false;
            }

            if (block.hash !== Block.blockHash(block)) {
                console.log(`Invalid hash at block ${i}`);
                return false;
            }
        }
        return true;
    }

/*    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.log('Received chain is not longer than the current chain');
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log('The received chain is not valid');
            return;
        } 
        console.log('Replacing the received chain...');
        this.chain = newChain;
    }
*/

    saveBlockchain() {
        const directory = path.join(__dirname, '../../Backup');
        const filePath = path.join(directory, 'blockchain.json');
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(this.chain, null, 2));
        console.log('Blockchain saved to disk.');
    }

    static loadBlockchain() {
        const filePath = path.join(__dirname, '../../Backup/blockchain.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath);
            const chainData = JSON.parse(data);
            const bc = new Blockchain();
            bc.chain = chainData;
            console.log('Loaded chain from file...');
            return bc;
        } else {
            console.log('No existing blockchain found, initializing new blockchain...');
            const bc = new Blockchain();
            bc.saveBlockchain();
            return bc;
        }
    }
}

module.exports = Blockchain;
