
const DIFFICULTY = 6;
const MINE_RATE = 10;
const INITIAL_BALANCE = 0;
const MINING_REWARD = 6.66666666;
let isMining = false;
let miningTimeout;
const MINING_INTERVAL = 300000;
const TARGET_TIME = 5 * 60 * 1000;
let numWorkers = 6;

module.exports = { DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD,
	isMining,  miningTimeout, MINING_INTERVAL, TARGET_TIME, numWorkers };
