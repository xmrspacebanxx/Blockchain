
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

    isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            return false;
        }
        for(let i = 1; i < chain.length; i++){
            const block = chain[i];
            const lastBlock = chain[i -1];
            if((block.lastHash !== lastBlock.hash) || (block.hash !== Block.blockHash(block))){
                return false;
            }
        }
        return true;
    }

    replaceChain(newChain){
        if(newChain.length <= this.chain.length){
            console.log('Received chain is not longer than the current chain');
            return;
        } else if(this.isValidChain(newChain)){
            console.log('the received chain is not valid');
            return;
        }
        console.log('Replacing the received chain...');
        this.chain = newChain;
    }
    
}

module.exports = Blockchain;
