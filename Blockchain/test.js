
const BlockchainClass = require('./index');
const BlockClass = require('./Block');

const {DIFFICULTY} = require('../config');

describe('Block', ()=>{
    let data, lastBlock, block;
    beforeEach(()=>{
        data = 'bar';
        lastBlock = BlockClass.genesis();
        block = BlockClass.mineBlock(lastBlock, data);
    });
// Test 1
    it('sets the data to match the input', ()=>{
        expect(block.data).toEqual(data);
    });
// Test 2
    it('sets the lastHash to match the hash of the last block', ()=>{
        expect(block.lastHash).toEqual(lastBlock.hash);
    });
// Test 3
    it('generates a hash that matches the difficulty', ()=>{
        expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(DIFFICULTY));
    });
})

describe('Blockchain', ()=>{
    let bc;
    let bc2;
    beforeEach(() => {
        bc = new BlockchainClass();
        bc2 = new BlockchainClass();
    });

    it('Start the genesis Block', () => {
        expect(bc.chain[0]).toEqual(BlockClass.genesis());
    });

    it('adds the new block', () => {
        const data = 'foo';
        bc.addBlock(data);
        expect(bc.chain[bc.chain.length -1].data).toEqual(data);
    });

    it('validate a valid chain', ()=>{
        bc2.addBlock('foo');
        expect(bc2.isValidChain(bc2.chain)).toBe(true);
    });

    it('validate a chain with a corrup genesis block', ()=>{
        bc2.chain[0].data = 'gasdgqweeeeetg';
        expect(bc2.isValidChain(bc2.chain)).toBe(false);
    });

    it('Invalidate a corrupt chain', ()=>{
        bc2.addBlock('foo');
        bc2.chain[1].data = 'kjlfkasuhn';
        expect(bc.isValidChain(bc2.chain)).toBe(false);
    });

    it('replace the chain with a valid chain', ()=>{
        bc2.addBlock('goo');
        bc.replaceChain(bc2.chain);
        expect(bc.chain).toEqual(bc2.chain);
    });

    it('does not replace the blockchain with one of less than or equal to length', ()=>{
        bc.addBlock('foo');
        bc.replaceChain(bc2.chain);
        expect(bc.chain).not.toEqual(bc2.chain);
    })


});


