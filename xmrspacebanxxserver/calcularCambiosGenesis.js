
const fs = require('fs');
const path = require('path'); // <-- ¡FALTABA ESTA LÍNEA!

const genesisPath = path.join(__dirname, './genesis/genesis.json');
const backupPath = path.join(__dirname, './genesis/genesis_backup.json');

const toBigInt = (value) => {
  try {
    return BigInt(value);
  } catch {
    return BigInt(0);
  }
};

try {
  const genesisData = JSON.parse(fs.readFileSync(genesisPath));
  const backupData = JSON.parse(fs.readFileSync(backupPath));

  const allocNew = genesisData.alloc || {};
  const allocOld = backupData.alloc || {};

  console.log('\n=== CAMBIOS EN LOS BALANCES ===');

  const allAddresses = new Set([...Object.keys(allocOld), ...Object.keys(allocNew)]);

  let cambios = 0;

  for (const address of allAddresses) {
    const oldBalance = toBigInt(allocOld[address]?.balance || '0');
    const newBalance = toBigInt(allocNew[address]?.balance || '0');

    if (oldBalance !== newBalance) {
      const diff = newBalance - oldBalance;
      console.log(`\n🔁 Dirección: ${address}`);
      console.log(`  🪙 Anterior: ${oldBalance}`);
      console.log(`  🪙 Nuevo:    ${newBalance}`);
      console.log(`  🔄 Cambio:   ${diff > 0n ? '+' : ''}${diff}`);
      cambios++;
    }
  }

  if (cambios === 0) {
    console.log('✅ No hubo cambios en los balances.');
  }

} catch (err) {
  console.error('❌ Error al leer o procesar los archivos:', err.message);
}

