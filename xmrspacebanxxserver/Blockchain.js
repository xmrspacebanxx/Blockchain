
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');
const Block = require('./Block');
const os = require('os');

class Blockchain{

    constructor(){
        this.chain = [Block.genesis()];
    }

    getLastBlock(){
        return this.chain[this.chain.length -1];
    }

    addBlock(newBlock){
        //if(this.isDuplicateNonce(newBlock.nonce)){
        //    console.log('Invalid nonce');
        //    return false;
        //}
        if (this.isDuplicateHash(newBlock.hash)) {
            console.log('\x1b[31m%s\x1b[0m', 'Invalid hash');
        }
        if(this.isValidNewBlock(newBlock, this.getLastBlock())){
            this.chain.push(newBlock);
            if(this.isValidChain(this.chain)){
                this.saveBlockchain();
                return true;
            } else {
                console.log('Invalid chain after adding block.');
                return false;
            }
        } else {
            console.log('Invalid block.');
            return false;
        }
    }

    isValidNewBlock(newBlock, lastBlock){
        if(newBlock.lastHash !== lastBlock.hash){
            console.log('\x1b[31m%s\x1b[0m', `Invalid lastHash at block ${newBlock.index}`);
            return false;
        }
        if(newBlock.hash !== Block.blockHash(newBlock)){
            console.log('\x1b[31m%s\x1b[0m', `Invalid hash at block ${newBlock.index}`);
            return false;
        }
        return true;
    }

    //isDuplicateNonce(nonce) {
    //    for (let block of this.chain) {
    //        if(block.nonce === nonce) {
    //            return true;
    //        }
    //    }
    //    return false;
    //}

    isDuplicateHash(hash) {
        for (let block of this.chain) {
            if (block.hash === hash) {
                return true;
            }
        }
        return false;
    }

    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            console.log('\x1b[31m%s\x1b[0m', 'Genesis block does not match');
            return false;
        }
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];

            if (block.lastHash !== lastBlock.hash) {
                console.log('\x1b[31m%s\x1b[0m', `Invalid lastHash at block ${i}`);
                return false;
            }
            if (block.hash !== Block.blockHash(block)) {
                console.log('\x1b[31m%s\x1b[0m', `Invalid hash at block ${i}`);
                return false;
            }
        }
        return true;
    }

    /*replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.log('Received chain is not longer than the current chain');
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log('The received chain is not valid');
            return;
        } 
        console.log('Replacing the received chain...');
        this.chain = newChain;
        this.saveBlockchain();
    }*/

    toJSON() {
        return JSON.stringify(this.chain);
    }

    static fromJSON(data) {
        let bc = new Blockchain();
        bc.chain = JSON.parse(data);
        return bc;
    }

    saveBlockchain() {
		const directory = os.homedir();
        const filePath = path.join(directory, 'ONYXCHAIN6.json');
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        //const encrypted = 			
		//CryptoJS.AES.encrypt(JSON.stringify(this.toJSON()),"MDCCLXXVI").toString();
        //fs.writeFileSync(filePath, encrypted);
		fs.writeFileSync(filePath, JSON.stringify(this.chain, null, 2));
        console.log('Blockchain saved to disk.');
    }

    static loadBlockchain() {
		const directory = os.homedir();
        const filePath = path.join(directory, 'ONYXCHAIN6.json');  
        try {
            if (fs.existsSync(filePath)) {
                //const encryptedData = fs.readFileSync(filePath, 'utf8');
                //const bytes = CryptoJS.AES.decrypt(encryptedData, 'MDCCLXXVI');
                //const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                //const chainData = JSON.parse(decrypted);
				const data = fs.readFileSync(filePath);
				const chainData = JSON.parse(data);
				const bc = new Blockchain();
				bc.chain = chainData
                console.log('\x1b[32m%s\x1b[0m', 'Loaded chain from file...');
				return bc;
                //return Blockchain.fromJSON(chainData);
            } else {
                console.log('No existing blockchain found, initializing new blockchain...');
                const bc = new Blockchain();
                bc.saveBlockchain();
                return bc;
            }
        } catch (error) {
            console.error(error.message);
            return error;
        }      
    }
}

module.exports = Blockchain;
