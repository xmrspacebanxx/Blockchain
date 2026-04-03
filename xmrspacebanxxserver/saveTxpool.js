import Web3  from "web3";
import { HttpProvider } from "web3-providers-http";
import fs from "fs";
import crypto from "crypto";
import os from "os";
import path from "path";
import fetch from 'node-fetch';

// Crear el proveedor
const provider = new HttpProvider("http://localhost:8545");

// Crear la instancia de web3
const web3 = new Web3(provider);

// Archivos de configuración
const TXPOOL_FILE = './data/txpool/txpool_backup.json';
const GENESIS_FILE = './data/genesis/genesis.json';
const ACCOUNTS_FILE = './data/accounts/accounts.json';
const BLOCKCHAIN_DIR = './blockchain';
const HASHES_FILE = './blockchain/processed_hashes.json';
const ETH_FILE = path.join(os.homedir(), 'CRYPTON', 'genesis.json');

// Configuración de Discord
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1391201039218114581/HjJoKmgPoG73EN7C4g_praHUSc-CpNZNAfC_Mr446ClDd_pQi81rT6GlKk9smWB89Gqe';


// Cargar genesis y normalizar claves de alloc
let genesis = JSON.parse(fs.readFileSync(GENESIS_FILE));
let balances = {};
for (const [addr, data] of Object.entries(genesis.alloc)) {
    balances[addr.toLowerCase()] = { balance: data.balance };
}
genesis.alloc = balances;

// Cargar lista de transacciones ya procesadas
function loadProcessedHashes() {
    try {
        return new Set(JSON.parse(fs.readFileSync(HASHES_FILE)).txHashes);
    } catch {
        return new Set();
    }
}

// Guardar lista actualizada de transacciones procesadas
function saveProcessedHashes(hashSet){
    const txHashes = Array.from(hashSet);
    fs.writeFileSync(HASHES_FILE, JSON.stringify({ txHashes }, null, 2));
}

// Buscar dirección exacta con formato original
function findExactAddressMatch(address, alloc) {
    return alloc[address.toLowerCase()] ? address.toLowerCase() : null;
}


// Aplicar la transacción
async function applyTransaction(tx, balances) {
    const fromKey = findExactAddressMatch(tx.from, balances);
    const toKey = findExactAddressMatch(tx.to, balances) || tx.to.toLowerCase(); // ✅ siempre minúsculas

    if (!fromKey) {
        console.log(`❌ Dirección remitente no encontrada en genesis: ${tx.from}`);
        return false;
    }

    // Inicializar cuenta destino si no existe
    if (!balances[toKey]) {
        balances[toKey] = { balance: '0' };
        console.log(`✅ Cuenta destino ${toKey} inicializada con saldo 0.`);
    }

    const value = BigInt(tx.value || '0');
    const gas = BigInt(tx.gas || '0');
    const gasPrice = BigInt(tx.gasPrice || tx.maxFeePerGas || '0');
    const fee = gas * gasPrice;
    const totalCost = value + fee;

    const fromBal = BigInt(balances[fromKey]?.balance || '0');
    const toBal = BigInt(balances[toKey]?.balance || '0');

    if (fromBal < totalCost) {
        console.log(`❌ Saldo insuficiente o error en la transacción ${fromKey}`);
        return false;
    }

    balances[fromKey].balance = (fromBal - totalCost).toString();
    balances[toKey].balance = (toBal + value).toString();

    console.log(`✅ Transacción aplicada: ${fromKey} ➡️ ${toKey} por ${value.toString()} wei`);

    await enviarTicketPorDiscord(tx);
    return true;
}


// Procesar el txpool
function processTxpool(txpool, balances) {
    const processedHashes = loadProcessedHashes();
    let update = false;

    for (const section of ['pending', 'queued']) {
        const txsByAddr = txpool[section] || {};
        for (const fromAddr in txsByAddr) {
            for (const nonce in txsByAddr[fromAddr]) {
                const tx = txsByAddr[fromAddr][nonce];
                if (!tx?.hash) continue;

                if (!processedHashes.has(tx.hash)) {
                    const applied = applyTransaction(tx, balances);
                    if (applied) {
                        const block = {
                            hash: tx.hash,
                            timestamp: Date.now(),
                            transactions: [tx],
                            state: { ...balances }
                        };
                        const filename = `block_${tx.hash}.json`;
                        fs.writeFileSync(path.join(BLOCKCHAIN_DIR, filename), JSON.stringify(block, null, 2));
                        console.log(`✅ Bloque guardado: ${filename}`);

                        processedHashes.add(tx.hash);
                        update = true;
                    }
                } else {
                    //console.log(`🔁 Transacción ya procesada: ${tx.hash}`);
                }
            }
        }
    }

    if (update) {
        saveProcessedHashes(processedHashes);
        console.log('✅ Archivo de hashes actualizado.');
    } else {
        console.log(`[${new Date().toISOString()}] No hay nuevas transacciones para procesar.`);
    }
}

// Agregar el metodo personalizado para txpool_content
web3.extend({
  property: 'txpool',
  methods: [{
    name: 'content',
    call: 'txpool_content'
  }]
});

// Archivo donde se guardaran las transacciones
const OUTPUT_FILE = TXPOOL_FILE;
let lastHash = "";

async function getTxpoolContent() {
    try { 
        return await web3.txpool.content();
    } catch (error) {
        console.error(`[ERROR][${new Date().toLocaleTimeString()}] Error al consultar txpool: ${error.message}`);
        return null;
    }
}

function hashTxpool(txpool) {
    // Crear un hash del contenido actual para detectar cambios
    return crypto.createHash('sha256').update(JSON.stringify(txpool)).digest('hex');
}

function saveTxpoolToFile(txpool) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(txpool, null, 2));
    console.log(`[${new Date().toISOString()}] Txpool Actualizado...`);
}

async function monitorTxpool() {
    const txpool = await getTxpoolContent();
    if (!txpool) return;

    const currentHash = hashTxpool(txpool);

    // Si el hash ha cambiado, guardamos el txpool
    if (currentHash !== lastHash) {
        saveTxpoolToFile(txpool);
        lastHash = currentHash;

        // ✅ Procesar nuevas transacciones
        processTxpool(txpool, balances);

        // ✅ Guardar estado actualizado de genesis
        genesis.alloc = balances;
        fs.writeFileSync(GENESIS_FILE, JSON.stringify(genesis, null, 2));
        fs.writeFileSync(ETH_FILE, JSON.stringify(genesis, null, 2));
        console.log(`[${new Date().toISOString()}] Nuevos saldos actualizados.`);

    } else {
        console.log(`[${new Date().toISOString()}] No hay cambios en el txpool.`);
    }
}

//Enviar notificación por discord
async function enviarTicketPorDiscord(tx) {
    // Convertir wei a ETH
    const eth = Number(tx.value) / 1e18;

    let usd = 0;
    try {
        // Obtener el precio actual de ETH en USD
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await res.json();
        usd = eth * data.ethereum.usd;
    } catch (err) {
        console.error('❌ Error obteniendo el precio de ETH:', err.message);
    }
    
    const mensaje = `📨 NUEVA TRANSACCIÓN\n\nHash: ${tx.hash}\nDe: ${tx.from}\nPara: ${tx.to}\nValor: ${eth.toFixed(6)} ETH (${usd.toFixed(2)} USD)\n`;
    
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify( { content: mensaje })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        console.log('✅ Ticket enviado a Discord');
    } catch (err) {
        console.error('❌ Error enviando a Discord:', err.message);
    }  
}

// ✅ Ejecución principal
(async () => {
    console.log(`[BOOT][${new Date().toLocaleTimeString()}] Iniciando saveTxpool.js...`);

    while (true) {
        try {
            const available = await web3.eth.net.isListening();
            if (!available) {
                console.warn(`[WARN][${new Date().toLocaleTimeString()}] Geth aún no está disponible. Esperando 10 segundos...`);
                await new Promise(r => setTimeout(r, 10000));
                continue;
            }

            await monitorTxpool();
        } catch (error) {
            console.error(`[ERROR][${new Date().toLocaleTimeString()}] Error al procesar txpool: ${error.message}`);
        }

        const TIME = 9;
        console.log(`[INFO][${new Date().toLocaleTimeString()}] Esperando ${TIME} minutos para el siguiente ciclo...`);
        await new Promise(resolve => setTimeout(resolve, TIME * 60 * 1000));
    }
})();

