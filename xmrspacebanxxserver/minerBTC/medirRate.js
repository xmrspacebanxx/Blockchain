const SHA256 = require('crypto-js/sha256');

// 🔹 Un header ficticio de bloque para simular hashing
// (en minería real este vendría de getblocktemplate o del pool)
const headerBase = "00000020aabbccddeeff00112233445566778899aabbccddeeff001122334455" +
                   "99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa";


// 🔹 Función de doble SHA256 (sha256d)
function sha256d(input) {
  return SHA256(SHA256(input));
}

// ⏱️ Medición
const start = Date.now();
let count = 0;

for (let nonce = 0; nonce < 1_000_000; nonce++) {
  // Hasheamos concatenando el header con el nonce
  sha256d(headerBase + nonce.toString(16).padStart(8, "0"));
  count++;
}

const elapsed = (Date.now() - start) / 1000;
console.log(`⛏️ Hashrate: ${(count / elapsed / 1e6).toFixed(2)} MH/s`);
