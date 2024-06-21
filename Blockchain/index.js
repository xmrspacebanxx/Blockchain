
const fs = require('fs');
const Block = require('./Block');

class Blockchain{
    constructor(){
        this.chain = this.loadBlockchain() || [Block.genesis()];
    }

    getLastBlock(){
        return this.chain[this.chain.length -1];
    }

    addBlock(data){
        const block = Block.mineBlock(this.getLastBlock(), data);
        this.chain.push(block);
        this.saveChain();
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

    saveChain(){
        // Convertir objeto JavaScript a JSON y escribirlo en un archivo
            fs.writeFile('bc.json', JSON.stringify(this.chain, null, 2), (err) => {
                console.log('Blockchain guardada en bc.json');
            });
    }

    loadBlockchain() {
        if (fs.existsSync('bc.json')) {
            const data = fs.readFileSync('bc.json');
            return JSON.parse(data);
        }
        return null;
    }
    
}

module.exports = Blockchain;