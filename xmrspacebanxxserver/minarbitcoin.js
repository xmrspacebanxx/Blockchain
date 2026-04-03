/*const crypto = require('crypto');

// Función para calcular el hash del bloque
function calculateHash(version, previousHash, merkleRoot, time, bits, nonce) {
    const header =
        version.toString(16).padStart(8, '0') +
        previousHash +
        merkleRoot +
        time.toString(16).padStart(8, '0') +
        bits +
        nonce.toString(16).padStart(8, '0');
    
    return crypto.createHash('sha256').update(
        crypto.createHash('sha256').update(Buffer.from(header, 'hex')).digest()
    ).digest('hex');
}

// Datos del bloque génesis
const genesisBlock = {
    version: 1,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    time: 1231006505,
    bits: '1d00ffff',
    nonce: 0,
};

// Función para minar el bloque génesis
function mineBlock(block) {
    let nonce = 0;
    let hash = '';
    const target = '00000000ffff0000000000000000000000000000000000000000000000000000';
    
    console.log('Minando bloque...');
    while (true) {
        hash = calculateHash(block.version, block.previousHash, block.merkleRoot, block.time, block.bits, nonce);
        if (hash < target) {
            console.log(`Bloque minado con nonce: ${nonce}`);
            console.log(`Hash: ${hash}`);
            return { ...block, nonce, hash };
        }
        nonce++;
    }
}

const minedGenesisBlock = mineBlock(genesisBlock);
console.log('Bloque Génesis minado:', minedGenesisBlock);
*/
const crypto = require('crypto');

// Función para hacer doble SHA-256
function doubleSHA256(data) {
  return crypto.createHash('sha256').update(crypto.createHash('sha256').update(data).digest()).digest();
}

// Datos del bloque #1 de Bitcoin
const version = Buffer.alloc(4);
version.writeUInt32LE(1, 0);

const prevBlockHash = Buffer.from('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f', 'hex').reverse();

const merkleRoot = Buffer.from('0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098', 'hex').reverse();

const time = Buffer.alloc(4);
time.writeUInt32LE(1231469665, 0);

const bits = Buffer.from('1d00ffff', 'hex').reverse();

const nonce = Buffer.alloc(4);
nonce.writeUInt32LE(2573394689, 0);

// Construcción del encabezado del bloque
const blockHeader = Buffer.concat([version, prevBlockHash, merkleRoot, time, bits, nonce]);

// Cálculo del hash del bloque (doble SHA-256)
const hash = doubleSHA256(blockHeader).reverse().toString('hex');

console.log('Hash generado:', hash);
console.log('Hash esperado: 00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048');




