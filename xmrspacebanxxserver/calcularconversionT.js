
const fs = require('fs');
const path = require('path');

const txpoolPath = path.resolve(__dirname, 'genesistxpool.json');

// Cargar archivo JSON
const txpool = JSON.parse(fs.readFileSync(txpoolPath, 'utf8'));

// Utilidad para convertir hex a decimal BigInt
const hexToDecimal = (hex) => BigInt(hex);

// Obtener transacciones desde "queued"
const queuedTxs = txpool.result.queued;

// Función para convertir una transacción a formato personalizado
function convertTransaction(tx) {
  const gas = hexToDecimal(tx.gas);
  const gasPrice = hexToDecimal(tx.gasPrice);
  const fee = gas * gasPrice;
  const value = hexToDecimal(tx.value);
  const amount = value + fee;

  return {
    id: tx.hash.slice(2, 10) + '-' + tx.hash.slice(10, 14) + '-' + tx.hash.slice(14, 18),
    input: {
      timestamp: Date.now(), // O puedes usar otro timestamp si lo deseas
      amount: amount.toString(),
      address: tx.from.toLowerCase().replace(/^0x/, ''),
      signature: {
        r: tx.r.replace(/^0x/, ''),
        s: tx.s.replace(/^0x/, ''),
        recoveryParam: parseInt(tx.v, 16) % 2
      }
    },
    outputs: [
      {
        amount: (value).toString(),
        address: tx.to.toLowerCase().replace(/^0x/, '')
      },
      {
        amount: fee.toString(),
        address: tx.from.toLowerCase().replace(/^0x/, '')
      }
    ]
  };
}

// Recorrer todas las direcciones en 'queued'
const result = [];
for (const addr in queuedTxs) {
  const txns = queuedTxs[addr];
  for (const nonce in txns) {
    result.push(convertTransaction(txns[nonce]));
  }
}

// Guardar el resultado en un archivo nuevo
fs.writeFileSync('converted_tx.json', JSON.stringify(result, null, 2));

console.log('Transacciones convertidas guardadas en converted_tx.json');
