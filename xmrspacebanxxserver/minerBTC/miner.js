const net = require("net");
const { Worker } = require("worker_threads");

const POOL = "stratum.braiins.com";   // ✅ Endpoint unificado
const PORT = 3333;                    // ⚡ TCP (usa 3334 si quieres SSL)
const USER = "xmrspacebanxx.worker1";     // ⚠️ cámbialo a tu cuenta.worker
const PASSWORD = "";

const NUM_WORKERS = 100;
const MAX_NONCE = 0xFFFFFFFFn;  // rango total de nonces (32 bits)

let extranonce1 = null;
let extranonce2_size = null;
let extranonce2_counter = 0;

let shareTarget = null;
let job = null;

const client = new net.Socket();

// Conectar al pool
client.connect(PORT, POOL, () => {
  console.log(`⛏️ Conectado a ${POOL}:${PORT}`);

  client.write(JSON.stringify({
    id: 1,
    method: "mining.subscribe",
    params: []
  }) + "\n");

  client.write(JSON.stringify({
    id: 2,
    method: "mining.authorize",
    params: [USER, PASSWORD]
  }) + "\n");
});

// Convertir dificultad a target
function diffToTarget(diff) {
  return ((1n << 256n) - 1n) / BigInt(Math.floor(diff));
}

let workers = [];
function startWorkers() {
  workers = Array.from({ length: NUM_WORKERS }, (_, i) => {
    const w = new Worker("./worker.js");

    w.on("message", (msg) => {
      if (msg.found && msg.job_id === job.job_id && msg.nonce && msg.hash) {
        console.log(`✅ Share válido! Nonce=${msg.nonce}, Hash=${msg.hash}`);
        const submit = {
          id: 4,
          method: "mining.submit",
          params: [USER, job.job_id, msg.extranonce2, job.ntime, msg.nonceHex]
        };
        client.write(JSON.stringify(submit) + "\n");
      }

      if (msg.done) {
        extranonce2_counter++;
        assignRange(w, job, extranonce2_counter);
      }
      });
    return w;
  });
}

function assignRanges(job) {
  if (!job || !shareTarget) return;

  const rangeSize = (MAX_NONCE + 1n) / BigInt(NUM_WORKERS);

  workers.forEach((w, i) => {
    const start = BigInt(i) * rangeSize;
    const end = (i === NUM_WORKERS - 1)
      ? MAX_NONCE
      : (start + rangeSize - 1n);

    const extranonce2 = extranonce2_counter.toString(16).padStart(extranonce2_size * 2, "0");

    w.postMessage({
      ...job,
      start: start.toString(),
      end: end.toString(),
      extranonce2,
      shareTarget
    });
  });
}

function assignRange(worker, job, extraNonce2Value) {
  const extranonce2 = extraNonce2Value.toString(16).padStart(extranonce2_size * 2, "0");

  worker.postMessage({
    ...job,
    start: "0",
    end: MAX_NONCE.toString(),
    extranonce2,
    shareTarget
  });
}

// Manejo de mensajes del pool
client.on("data", (data) => {
  const lines = data.toString().trim().split("\n");
  for (const line of lines) {
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }

    if (msg.id === 1 && msg.result) {
      extranonce1 = msg.result[1];
      extranonce2_size = msg.result[2];
      console.log(`ExtraNonce1: ${extranonce1}, ExtraNonce2 size: ${extranonce2_size}`);
      startWorkers();
    }

    if (msg.method === "mining.set_difficulty") {
      const diff = msg.params[0];
      const target = diffToTarget(diff);
      shareTarget = target.toString(16);
      console.log(`🎚️ Dificultad del pool: ${diff}`);
      console.log(`Target actualizado: 0x${shareTarget}`);
    }

    if (msg.method === "mining.notify") {
      const [job_id, prevhash, coinb1, coinb2, merkle_branch, version, nbits, ntime] = msg.params;
      console.log(`\n🆕 Nuevo trabajo recibido: ${job_id}`);

      extranonce2_counter = 0;

      job = { job_id, prevhash, coinb1, coinb2, merkle_branch, version, nbits, ntime, extranonce1, extranonce2_size };

      assignRanges(job);
    }

    if (msg.id === 4) {
      if (msg.result === true) {
        console.log("✅ Share ACCEPTED por el pool");
      } else {
        console.log("❌ Share REJECTED:", msg.error);
      }
    }
  }
});


