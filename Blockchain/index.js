
const fs = require('fs');
const Block = require('./Block');

class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
    }

    getLastBlock(){
        return this.chain[this.chain.length -1];
    }

    addBlock(data){
        const block = Block.mineBlock(this.getLastBlock(), data);
        this.isValidBlock(block);
        return block;
    }

    isValidBlock(block){
        const lastBlock = this.getLastBlock;
        if(lastBlock.lastHash == block.lastHash){
            return;
        } else {
            return block;
        }
    }

    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            console.log('Genesis block does not match');
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];

            // Verificar que lastHash coincide
            if (block.lastHash !== lastBlock.hash) {
                console.log(`Invalid lastHash at block ${i}`);
                return false;
            }

            // Verificar que el hash del bloque es correcto
            if (block.hash !== Block.blockHash(block)) {
                console.log(`Invalid hash at block ${i}`);
                return false;
            }
        }
        return true;
    }
    
    replaceChain(newChain) {
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

    // Function to save blockchain to file
    saveBlockchain() {
        fs.writeFileSync('../Backup/blockchain.json', JSON.stringify(this.chain, null, 2));
    }

    // Function to load blockchain from file
    static loadBlockchain() {
        if (fs.existsSync('../Backup/blockchain.json')) {
            const data = fs.readFileSync('../Backup/blockchain.json');
            const chainData = JSON.parse(data);
            const bc = new Blockchain();
            bc.replaceChain(chainData);
            return bc;
        } else {
            const bc = new Blockchain();
            bc.saveBlockchain();
            return bc;
        }
    }

}

module.exports = Blockchain;