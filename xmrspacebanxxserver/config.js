
//const blockchainName = 'BETO';
const blockchainName = 'Dollar.json';
//const blockchainName = 'QuokkaCoin.json';
const walletName = 'MDCCLXXVI.json';
//const blockchainName = 'U$D.json';
const genesisBlock = 'Dollar';
//const genesisBlock = 'Quokka Coin 🌱';
//const genesisBlock = 'U$D';

const DIFFICULTY = 1;
//const DIFFICULTY = 4;
//const DIFFICULTY = 7;
//const DIFFICULTY = 5;

//const MINE_RATE = 180000;
const MINE_RATE = 10000;

const INITIAL_BALANCE = 0;

//const MINING_REWARD = 1;
const MINING_REWARD = 1000000;
//const MINING_REWARD = 6;
//const MINING_REWARD = 50;

const NETWORK = true;

let isMining = true;
//let amountCash = 2;
//let amountBlocks = 70000 + amountCash;
//let amountCash = 0;
//let amountBlocks = 180000 + amountCash;
let amountCash = 530;
let amountBlocks = 3000 + amountCash;

const minDifficulty = 6;
const maxDifficulty = 6;
//const minDifficulty = 4;
//const maxDifficulty = 7;
//const minDifficulty = 6;
//const maxDifficulty = 8;

const minWorkers = 1;
const maxWorkers = 10;

let miningTimeout;
const MINING_INTERVAL = 600000;
const TARGET_TIME = 10000;
//const TARGET_TIME = 180000;

let numWorkers = 6;
//let numWorkers = 10;

//400 $76100 45000
const walletMiner = "049766a7c1aee6c920cfd47ce3827e85f88b50768c24295d3bb0bc9301bb6801ad15c4e33fde05739afa77c4d88df5608e0c13f700358da4302307b6caa150da89";

//800 //venezuela 46000
//const walletMiner = "0464d38dc36e5d18d735611d8c65c41e9d628638f1b69d7dd38622bd19833f8644567c4d98efe3b75dc02756ff19775baa75b6568cc2f539ab58d000f32d5f4578";

//1800
//const walletMiner = "0417516349d520684a6a705f7fc0bcebe34aef9d855f5d598f57ca35c3bee1685f84bf45e6225571c92f81f68f9bed6174bcf3a2081a4c912826f75f4e0f305a9c";

//6000
//const walletMiner = "04898d2f4375e1cee4accb75d070448dea9516633c2420242768ecf1d557dc8d481eeb7416068aee666a84ecec06c0fbf0d368cc77cc0daece3d0c3ace0e628bb7";

//6500
//const walletMiner = "046aee826ed10e39c2b88d18e924e36b4b6b64be4b90bd822d2bfa4e0c3205d69a991ae61674c2ac287420721e9fa489279d317f2b0d070b8c30d11b3999097a8f";

//const walletMiner = "04a459ae7a574e954b0ef1c045b30e88d6aa0749c1c1643e9adff4e89d5cdd5e077dd95f9ae601c9c0b40839ef73a8fe72834aae07c8ad93853a0cddf455c2b852";

//38000
//const walletMiner = "04b7a8f4ad3fae8cf70b8513920a475a929e07d9e260dc48c01ce62d7557c40241ab5c5c4807e6b332db46c89e3e2fde16376588ca637cdd91ab5c4a14d513f91b";

//60000
//const walletMiner = "0461ae6e28daf30c4c3990542e126484e61fabece8e4762d25ecd1bb934a854fd283a46f61efdd133e873ae3580dd769052b32e85eec2d919d578c35ec5800623b";


module.exports = { genesisBlock, blockchainName, walletName, NETWORK, minWorkers, maxWorkers, amountBlocks, DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD,
	isMining,  miningTimeout, MINING_INTERVAL, TARGET_TIME, numWorkers, walletMiner, minDifficulty, maxDifficulty };


/*
Timestamp
nonce
processtime
difficulty
xrsa-1543-fwas-ds
*/

//ciudad cyberpunk
///Alimentacion
///Diversion
///Investigacion
///

//bitcoin banco central
///Dollar
///NOW
///Bitcoin
///NFT - Arte Galeria - Arte Pixel
///CriptoBunker - Token

//minecraft o no hay windows!!!!



