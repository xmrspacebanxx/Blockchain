
const DIFFICULTY = 4;
const MINE_RATE = 10000;
const INITIAL_BALANCE = 0;
const MINING_REWARD = 333;
let isMining = true;
let miningTimeout;
const MINING_INTERVAL = 1000;
const TARGET_TIME = 10000;
let numWorkers = 2;
const walletMiner = "049766a7c1aee6c920cfd47ce3827e85f88b50768c24295d3bb0bc9301bb6801ad15c4e33fde05739afa77c4d88df5608e0c13f700358da4302307b6caa150da89";

module.exports = { DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD,
	isMining,  miningTimeout, MINING_INTERVAL, TARGET_TIME, numWorkers, walletMiner };
