
const DIFFICULTY = 9;
const MINE_RATE = 1000; // Wait time in milliseconds
const INITIAL_BALANCE = 0;
const MINING_REWARD = 9000;
let isMining = false;
let miningTimeout;
const MINING_INTERVAL = 60000; // Delay between mining attempts in milliseconds


module.exports = {DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD, isMining, miningTimeout, MINING_INTERVAL};