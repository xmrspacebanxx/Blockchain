
const fs = require("fs");
const path = require("path");

const genesisPath = path.join(__dirname, "/genesis/genesis.json");
const txpoolPath = path.join(__dirname, "/genesis/transactions.json");
const resultadoPath = path.join(__dirname, "/genesis/transacciones_aplicadas.json");

function hexToBigInt(hex) {
  return BigInt(hex);
}

function bigIntToHex(num) {
  return "0x" + num.toString(16);
}

function main() {
  const genesis = JSON.parse(fs.readFileSync(genesisPath));
  const txpool = JSON.parse(fs.readFileSync(txpoolPath));

  const alloc = genesis.alloc || {};
  const queued = txpool.queued || {};

  const aplicadas = [];
  const duplicadas = new Set();

  for (const from in queued) {
    for (const nonce in queued[from]) {
      const tx = queued[from][nonce];
      const to = tx.to;
      const value = hexToBigInt(tx.value);

      const dupKey = `${to}_${value.toString()}`;
      if (duplicadas.has(dupKey)) {
        continue; // evitar transacciones repetidas por valor y destinatario
      }

      const fromBalance = alloc[from] ? hexToBigInt(alloc[from].balance) : BigInt(0);

      if (fromBalance >= value) {
        // restar saldo al emisor
        alloc[from] = {
          balance: bigIntToHex(fromBalance - value),
        };

        // sumar saldo al receptor
        const toBalance = alloc[to] ? hexToBigInt(alloc[to].balance) : BigInt(0);
        alloc[to] = {
          balance: bigIntToHex(toBalance + value),
        };

        // registrar como aplicada
        aplicadas.push({ from, to, value: bigIntToHex(value) });
        duplicadas.add(dupKey);
      }
    }
  }

  // Guardar los cambios
  genesis.alloc = alloc;
  fs.writeFileSync(genesisPath, JSON.stringify(genesis, null, 2));

  // Limpiar el `queued`
  txpool.queued = {};
  fs.writeFileSync(txpoolPath, JSON.stringify(txpool, null, 2));

  // Guardar registro de transacciones aplicadas
  fs.writeFileSync(resultadoPath, JSON.stringify(aplicadas, null, 2));

  console.log(`✅ ${aplicadas.length} transacciones aplicadas.`);
}

main();

setInterval(main, 60000);


/*
xmrspacebanxx@fedora:~/WalletSpace/Blockchain$
 curl -X POST --data '{"jsonrpc":"2.0","method":
 "txpool_content","params":[],"id":1}' -H "Content-Type: 
 application/json" http://localhost:8545 | jq . > 
 transactions.json
*/
