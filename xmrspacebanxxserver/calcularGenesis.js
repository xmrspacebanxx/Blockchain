// Este script calcula el balance de cada dirección en el archivo genesis.json
const fs = require('fs');
const path = require('path');



// Rutas absolutas o relativas
const genesisPath = path.resolve(__dirname, './genesis/genesis.json');
const txpoolPath = path.resolve(__dirname, './genesis/transactions.json');

// Leer y parsear genesis.json
const genesis = JSON.parse(fs.readFileSync(genesisPath, 'utf8'));

// Leer y parsear txpool.json
const txpool = JSON.parse(fs.readFileSync(txpoolPath, 'utf8'));

const alloc = genesis.alloc;

// Normalizar dirección (en minúsculas)
const normalizeAddress = (addr) => addr.toLowerCase();

// Convertir string hex a BigInt
const hexToBigInt = (hex) => BigInt(hex);

// Convertir BigInt a string decimal
const bigIntToString = (val) => val.toString();

// Inicializar balances existentes
const balances = {};

// Cargar balances actuales
for (const address in alloc) {
  balances[normalizeAddress(address)] = BigInt(alloc[address].balance);
}

/*
// Procesar transacciones en 'queued'
const queuedTxs = txpool.result.queued;

for (const sender in queuedTxs) {
  for (const nonce in queuedTxs[sender]) {
    const tx = queuedTxs[sender][nonce];
    const from = normalizeAddress(tx.from);
    const to = normalizeAddress(tx.to);
    const value = hexToBigInt(tx.value);

    // Restar al emisor
    balances[from] = (balances[from] || 0n) - value;
    // Sumar al receptor
    balances[to] = (balances[to] || 0n) + value;
  }
}

// Procesar transacciones en 'pending'
const pendingTxs = txpool.result.pending;

for (const sender in pendingTxs) {
  for (const nonce in pendingTxs[sender]) {
    const tx = pendingTxs[sender][nonce];
    const from = normalizeAddress(tx.from);
    const to = normalizeAddress(tx.to);
    const value = hexToBigInt(tx.value);

    const senderBalance = balances[from] || 0n;

    if (senderBalance >= value) {
      balances[from] = senderBalance - value;
      balances[to] = (balances[to] || 0n) + value;
    } else {
      console.log(`⚠️  Transacción ignorada: ${from} no tiene saldo suficiente para enviar ${value}`);
    }
  }
}*/

// Procesar transacciones en 'pending'
const pendingTxs = txpool.result.pending;

for (const sender in pendingTxs) {
  for (const nonce in pendingTxs[sender]) {
    const tx = pendingTxs[sender][nonce];
    const from = normalizeAddress(tx.from);
    const to = normalizeAddress(tx.to);
    const value = hexToBigInt(tx.value);

    // Restar al emisor
    balances[from] = (balances[from] || 0n) - value;
    // Sumar al receptor
    balances[to] = (balances[to] || 0n) + value;
  }
}


// Actualizar el campo `alloc` en el genesis
genesis.alloc = {};

for (const addr in balances) {
  if (balances[addr] > 0n) {
    // Restaurar formato con 0x y minúsculas
    genesis.alloc[`0x${addr.slice(2)}`] = {
      balance: bigIntToString(balances[addr])
    };
  }
}

// Crear backup con el timestamp actual
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(__dirname, './genesis/genesis_backup.json');
//const backupPath = path.join(__dirname, `genesis_backup_${timestamp}.json`);
fs.copyFileSync(genesisPath, backupPath);
console.log(`Backup creado: ${backupPath}`);

// Guardar archivo actualizado
fs.writeFileSync(genesisPath, JSON.stringify(genesis, null, 2));
console.log('Archivo genesis actualizado correctamente.');


