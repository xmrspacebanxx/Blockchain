
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
        this.chain.push(block);
        return block;
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


    getChain() {
        return this.chain;
    }

    receiveChain(newChain) {
        this.replaceChain(newChain);
    }
    
}

module.exports = Blockchain;
