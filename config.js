
const DIFFICULTY = 7;
const MINE_RATE = 1; // Wait time in milliseconds
const INITIAL_BALANCE = 0;
const MINING_REWARD = 6;
let isMining = false;
let miningTimeout;
const MINING_INTERVAL = 300000; // Delay between mining attempts in milliseconds
const TARGET_TIME = 10 * 60 * 1000;
let numWorkers = 4;

module.exports = {DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD,
     isMining, miningTimeout, MINING_INTERVAL, TARGET_TIME, numWorkers};