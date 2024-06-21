// PRESUPUESTO: 300MIL MILLONES USD

const BlockchainClass = require('./Blockchain/index');
const BlockClass = require('./Blockchain/Block');

const bc = new BlockchainClass();

for(let i = 1; i<= 1000; i++){
    // block = new BlockClass(Date.now(), "0".repeat(64), "0".repeat(64), `Data${i}`);
    console.log(bc.addBlock(`Block ${i}`).toString());
}

// const fooBlock = BlockClass.mineBlock(BlockClass.genesis(), 'foorbar');

// const treeBlock = BlockClass.mineBlock(fooBlock, 'foorbar2');

// const fourBlock = BlockClass.mineBlock(treeBlock, 'foorbar3');

// const fiveBlock = BlockClass.mineBlock(fourBlock, 'foorbar4');


// console.log(BlockClass.genesis().toString());

// console.log(fooBlock.toString());

// console.log(treeBlock.toString());

// console.log(fourBlock.toString());

// console.log(fiveBlock.toString());


const Wallet = require('./Wallet');
const wallet = new Wallet;

console.log(wallet.toString());