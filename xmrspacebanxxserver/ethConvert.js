//Version de Ticket: 1.0.0
// Fecha de Creación: 2023-10-01
/*
//Metodo para actualizar el saldo de las transacciones
console.log("GOAT CHAIN STORE");
console.log("NIT. 131022366789-4");
console.log("TIENDA DE CRIPTOMONEDAS - BOGOTÁ");
console.log("AC. 26 #92-32, BOGOTÁ, COLOMBIA");
console.log("RESPONSABLE DE IVA");
console.log("AGENTE RETENEDOR DE IVA");
console.log("TEL. +57 601 775 93 18");
console.log("EMAIL: GOATCHAINSTORE@GMAIL.COM");
console.log("REFERENCIA:");
console.log(`COMPROBANTE DE TRANSACCION: ${HASHDEFACTURA}`);
console.log(`FECHA DE CREACIÓN: ${TIMESTAMP}`);
console.log("========================================");
console.log("INFORMACION DE CLIENTE:");
console.log(`NOMBRE DE CLIENTE: ${CLIENTE}`);
console.log(`NUMERO DE IDENTIFICACION: ${IDENTIFICACION}`);
console.log("========================================");
console.log("INFORMACION DE CRITPOMONEDA:");
console.log(`MONEDA: ${MONEDA}`);
console.log(`CANTIDAD: $ ${CANTIDAD}ETH`);
console.log(`TOTAL: $ ${PRECIO} USD`);
console.log("========================================");
console.log("INFORMACION DE TRANSACCION:");
console.log(`TIPO DE TRANSACCION: ${TIPODETRANSACCION}`); //STAKING
console.log(`HASH DE BLOQUE: ${HASHDETRANSACCION}`);
console.log(`DIRECCION DE ENVIO: ${DIRECCIONDEENVIO}`);
console.log(`DIRECCION DE RECEPCION: ${DIRECCIONDERECEPCION}`);
console.log("===================================================");
console.log("INFORMACION DE ALOJAMIENTO EN SERVIDOR:");
console.log(`WALLET: ${NOMBREDEWALLET}`); //METAMASK
console.log(`NOMBRE DE LA RED: ${NOMBREDELARED}`); //ETHEREUM_MAINNET
console.log(`RPC URL: ${RPCURL}`); //0x1
console.log(`NOMBRE DE RPC: ${NOMBREDERPC}`); //0x1
console.log(`IDENTIFICADOR DE CADENA: ${IDDECADENA}`); //0x1
console.log(`SIMBOLO: ${ETH}`); //0x1
console.log(`URL DE EXPLORADOR: N/A - ENCRIPTACION DE BLOQUE QR`); //0x1
console.log("===================================================");
console.log("INFORMACION DE PAGO:");
console.log(`FORMA DE PAGO: CONTADO`); //0x1
console.log(`MEDIO DE PAGO: EFECTIVO`); //0x1
console.log(`COSTO POR MINERIA DE BLOQUE:           $ 0.00 USD`); //0x1
console.log(`COSTO POR ENCRIPTACION DE BLOQUE):     $ 0.00 USD`); //0x1
console.log(`NINCL IVA ${IVA}% (EXPORTACION):       $ 0.00 USD`); //0x1
console.log(`NINCL IVA ${IVA}% (19%):               $ 0.00 USD`); //0x1
console.log(`TOTAL A PAGAR:       $ ${PRECIO * ( 1 + IVA)} USD`); //0x1
console.log("============================================================");
*/

const saldoInicial = BigInt("8000000000000000000"); // 1 ETH en wei
const saldoEnviado = BigInt("7999877442726266000"); // 0.6 ETH en wei
const saldoInicialMenosEnviado = BigInt(saldoInicial - saldoEnviado);
console.log(`Saldo inicial: ${saldoInicial} wei`);
console.log(`Saldo enviado: ${saldoEnviado} wei`);
console.log(`Saldo restante: ${saldoInicialMenosEnviado} wei`);
const saldoInicialReceptor = BigInt("0"); // 0.5 ETH en wei
const saldoNuevoReceptor = saldoInicialReceptor + saldoEnviado;
console.log(`Saldo inicial del receptor: ${saldoInicialReceptor} wei`);
console.log(`Saldo nuevo del receptor: ${saldoNuevoReceptor} wei`);
// 
const wei = BigInt("8000000000000000000");
const eth = Number(wei) / 1e18;
console.log(`${wei} wei son ${eth} ETH`);

const fs = require('fs');

// Ruta a tu archivo JSON (ajústala si es necesario)
const filePath = './txpool.json';

// Leer el archivo
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error leyendo el archivo:', err);
        return;
    }
    try {
        // Parsear el contenido del JSON
        const jsonData = JSON.parse(data);
        // Obtener el campo "queued"
        const queued = jsonData.result.queued;
        // Recorrer cada dirección en "queued"
        for (const address in queued) {
            console.log(`\nDirección: ${address}`);
            const transactions = queued[address];
            // Recorrer cada transacción para esa dirección
            for (const nonce in transactions) {
                const tx = transactions[nonce];
                console.log(`  Nonce: ${nonce}`);
                console.log(`    To: ${tx.to}`);
                console.log(`    Value: ${parseInt(tx.value, 16)} wei`);
                console.log(`    Hash: ${tx.hash}`);
                console.log(`    Gas Price: ${parseInt(tx.gasPrice, 16)} wei`);
            }
        }
    } catch (parseErr) {
        console.error('Error parseando el JSON:', parseErr);
    }
});

//0x71C7656EC7ab88b098defB751B7401B5f6d8976F
//275192087617575000000000000000
//0x4FEF9D741011476750A243aC70b9789a63dd47Df
//0x4FEF9D741011476750A243aC70b9789a63dd47Df

//infografia, certificado de tenencia.

//0xb860F0d49026CD6B1A4E7A9a2434Fa33C712a97c

function etherToWei(ether) {
    // Convertimos el string a un número grande como BigInt (soporta hasta 18 decimales)
    const [whole, fraction = ''] = ether.split('.');
    const wholeWei = BigInt(whole) * 10n ** 18n;

    // Ajustar decimales (hasta 18 dígitos, rellenamos con ceros si es necesario)
    const paddedFraction = (fraction + '0'.repeat(18)).slice(0, 18);
    const fractionWei = BigInt(paddedFraction);

    return wholeWei + fractionWei;
}

// Ejemplo de uso
const etherAmount = '420';
const weiAmount = etherToWei(etherAmount);
console.log(`Ether: ${etherAmount} -> Wei: ${weiAmount.toString()}`);
