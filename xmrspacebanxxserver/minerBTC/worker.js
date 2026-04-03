const { parentPort } = require("worker_threads");
const crypto = require("crypto");

// 🔄 Hash SHA256 doble
function sha256d(data) {
  return crypto.createHash("sha256").update(
    crypto.createHash("sha256").update(data).digest()
  ).digest();
}

parentPort.on("message", (job) => {
  const {
    job_id, prevhash, coinb1, coinb2, merkle_branch,
    version, nbits, ntime, extranonce1, extranonce2,
    start, end, shareTarget
  } = job;

  // Construir coinbase
  const coinbaseHex = coinb1 + extranonce1 + extranonce2 + coinb2;
  const coinbaseHash = sha256d(Buffer.from(coinbaseHex, "hex"));

  // Calcular merkle root
  let merkleRoot = coinbaseHash;
  for (const branch of merkle_branch) {
    const b = Buffer.from(branch, "hex");
    merkleRoot = sha256d(Buffer.concat([merkleRoot, b]));
  }

  // Armar header base
  const headerBase = Buffer.concat([
    Buffer.from(version, "hex").reverse(),
    Buffer.from(prevhash, "hex").reverse(),
    Buffer.from(merkleRoot, "hex").reverse(),
    Buffer.from(ntime, "hex").reverse(),
    Buffer.from(nbits, "hex").reverse(),
  ]);

  const targetBigInt = BigInt("0x" + shareTarget);

  const startNonce = BigInt(start);
  const endNonce = BigInt(end);

  let found = false;

  for (let nonce = startNonce; nonce <= endNonce; nonce++) {
    const nonceBuf = Buffer.alloc(4);
    nonceBuf.writeUInt32LE(Number(nonce));

    const header = Buffer.concat([headerBase, nonceBuf]);
    const hash = sha256d(header);
    const hashHex = Buffer.from(hash).reverse().toString("hex");
    const hashInt = BigInt("0x" + hashHex);

    if (hashInt < targetBigInt) {
      found = true;
      parentPort.postMessage({
        found: true,
        job_id,
        extranonce2,
        nonce: nonce.toString(),
        nonceHex: nonce.toString(16).padStart(8, "0"),
        hash: hashHex
      });
      break; // 🛑 Detenerse al encontrar share válido
    }
  }

    if (!found) {
      parentPort.postMessage({ done: true, job_id, found: false });
    }
});

