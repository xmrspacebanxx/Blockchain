const fs = require('fs');
const path = require('path');

// Rutas de archivos
const genesisPath = path.resolve(__dirname, './genesis/genesis.json');
const txpoolPath = path.resolve(__dirname, './genesis/transactions.json');

// Leer genesis
const genesis = JSON.parse(fs.readFileSync(genesisPath, 'utf8'));
const alloc = genesis.alloc || {};

// Leer transacciones (simuladas, no minadas)
const txpool = JSON.parse(fs.readFileSync(txpoolPath, 'utf8'));
const pendingTxs = txpool.result.pending || {};
const queuedTxs = txpool.result.queued || {};

// Normalizar dirección
const normalize = addr => addr.toLowerCase();
const toBigInt = hex => BigInt(hex);
const toString = val => val.toString();

// Inicializar balances desde genesis
const balances = {};
for (const address in alloc) {
  balances[normalize(address)] = BigInt(alloc[address].balance);
}

// Función para procesar transacciones
function processTxs(txs) {
  for (const sender in txs) {
    for (const nonce in txs[sender]) {
      const tx = txs[sender][nonce];
      const from = normalize(tx.from);
      const to = normalize(tx.to);
      const value = toBigInt(tx.value);

      const senderBalance = balances[from] || 0n;

      if (senderBalance >= value) {
        balances[from] = senderBalance - value;
        balances[to] = (balances[to] || 0n) + value;
      } else {
        console.log(`⚠️  Transacción ignorada: ${from} no tiene saldo suficiente para enviar ${value}`);
      }
    }
  }
}

// Procesar transacciones
//processTxs(pendingTxs);
processTxs(queuedTxs);

// Actualizar el campo alloc
genesis.alloc = {};
for (const addr in balances) {
  if (balances[addr] > 0n) {
    genesis.alloc[`0x${addr.slice(2)}`] = {
      balance: toString(balances[addr])
    };
  }
}
/*
// Crear backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//const backupPath = path.join(__dirname, `./genesis/genesis_backup_${timestamp}.json`);
const backupPath = path.join(__dirname, './genesis/genesis_backup.json');
fs.writeFileSync(backupPath, JSON.stringify(genesis, null, 2));

// Guardar archivo actualizado
fs.writeFileSync(genesisPath, JSON.stringify(genesis, null, 2));
console.log(`✅ Archivo genesis actualizado con saldos nuevos`);*/

// Crear backup con el timestamp actual
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//const backupPath = path.join(__dirname, './genesis/genesis_backup.json');
const backupPath = path.join(__dirname, `genesis_backup_${timestamp}.json`);
fs.copyFileSync(genesisPath, backupPath);
console.log(`Backup creado: ${backupPath}`);

// Guardar archivo actualizado
fs.writeFileSync(genesisPath, JSON.stringify(genesis, null, 2));
console.log('Archivo genesis actualizado correctamente.');


//INICIO DE COMPUTADORA
//ESPERAR A QUE CARGUE LA COMPUTADORA
//INICIAR GETH
//ESPERAR A QUE CARGUE GETH
//INICIAR ETHSERVER
//ESPERAR A QUE CARGUE ETHSERVER
//RECIBIR TRANSACCIONES * BUCLE
//GUARDAR TRANSACCIONES
//
//CREAR BACKUP DE GENESIS
//CREAR GENESIS
//RECIBIR TRANSACCIONES
//MINAR TRANSACCIONES
//CREAR BACKUP DE GENESIS
//CREAR GENESIS * BUCLE
//REMPLAZAR GENESIS * OPERADOR IO
