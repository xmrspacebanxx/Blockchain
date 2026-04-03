/*
//Metodo para actualizar el saldo de las transacciones
console.log("GOAT CHAIN STORE");
console.log("NIT. 131022366789-4");
console.log("TIENDA DE CRIPTOS - BOGOTÁ");
console.log("AC. 26 #92-32, BOGOTÁ, COLOMBIA");
console.log("RESPONSABLE DE IVA");
console.log("TEL. +57 601 775 93 18");
console.log("EMAIL: GOATCHAINSTORE@GMAIL.COM");
console.log("==================================");
console.log("REFERENCIA:");
console.log(`SERVICIO: RECARGA DE BILLETERA DIGITAL`);
console.log(`COMPROBANTE DE TRANSACCION: ${HASHDEFACTURA}`);
console.log(`FECHA DE CREACIÓN: ${TIMESTAMP}`);
console.log("==================================");
console.log("DATOS DE CLIENTE:");
console.log(`NOMBRE DE CLIENTE: ${CLIENTE}`);
console.log(`NUMERO DE IDENTIFICACION: ${IDENTIFICACION}`);
console.log("========================================");
console.log("INFORMACION DE CRITPOMONEDA:");
console.log(`MONEDA: ETHER`);
console.log(`CANTIDAD: $ ${CANTIDAD}ETH`);
console.log(`TOTAL: $ ${PRECIO} USD`);
console.log("========================================");
console.log("DATOS DE TRANSACCION:");
console.log(`TIPO DE TRANSACCION: ${TIPODETRANSACCION}`); //STAKING
console.log(`HASH DE BLOQUE: ${HASHDETRANSACCION}`);
console.log(`DIRECCION DE ENVIO: ${DIRECCIONDEENVIO}`);
console.log(`DIRECCION DE RECEPCION: ${DIRECCIONDERECEPCION}`);
console.log("===================================================");
console.log("DATOS DE ALOJAMIENTO EN EL SERVIDOR:");
console.log(`WALLET: ${NOMBREDEWALLET}`); //METAMASK
console.log(`NOMBRE DE LA RED: ${NOMBREDELARED}`);
console.log(`RPC URL: ${RPCURL}`); //0x1
console.log(`NOMBRE DE RPC: ${NOMBREDERPC}`); //0x1
console.log(`IDENTIFICADOR DE CADENA: ${IDDECADENA}`); //0x1
console.log(`SIMBOLO: ${ETH}`); //0x1
console.log(`URL DE EXPLORADOR: N/A - ENCRIPTACION POR BLOQUE QR`); //0x1
console.log("=====================================================");
console.log("DATOS DE PAGO:");
console.log(`FORMA DE PAGO: CONTADO(1)`); //0x1
console.log(`MEDIO DE PAGO: EFECTIVO`); //0x1
console.log(`COSTO POR MINERIA DE BLOQUE:           $ 0.00 USD`); //0x1
console.log(`COSTO POR ENCRIPTACION DE BLOQUE):     $ 0.00 USD`); //0x1
console.log(`NINCL IVA ${IVA}% (EXPORTACION):       $ 0.00 USD`); //0x1
console.log(`NINCL IVA ${IVA}% (19%):               $ 0.00 USD`); //0x1
console.log(`TOTAL A PAGAR:       $ ${PRECIO * ( 1 + IVA)} USD`); //0x1
console.log("========================================================");
console.log("SOFTWARE DE ENCRIPTACION: CRYPTON");
console.log("VERSION: 1.0.0");
console.log("(c) Crypton - Todos los derechos reservados 2025.");
*/

const saldoInicial = BigInt("334258333"); // 1 ETH en wei
const saldoEnviado = BigInt("334258333"); // 0.6 ETH en wei
const saldoInicialMenosEnviado = BigInt(saldoInicial - saldoEnviado);
console.log(`Saldo inicial: ${saldoInicial} wei`);
console.log(`Saldo enviado: ${saldoEnviado} wei`);
console.log(`Saldo restante: ${saldoInicialMenosEnviado} wei`);
const saldoInicialReceptor = BigInt("0"); // 0.5 ETH en wei
const saldoNuevoReceptor = saldoInicialReceptor + saldoEnviado;
console.log(`Saldo inicial del receptor: ${saldoInicialReceptor} wei`);
console.log(`Saldo nuevo del receptor: ${saldoNuevoReceptor} wei`);
// 
const wei = BigInt(saldoNuevoReceptor);
const weth = Number(wei) / 1e18;
console.log(`${wei} wei son ${weth} ETH`);

const eth = BigInt(saldoNuevoReceptor);
const ewei = BigInt(Number(eth) * 1e18);
console.log(`${eth} ETH son ${ewei} wei`);



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

//CANTIDAD DE ETH
//00120000000
//91730495773

//NGROK
//KXRNXFPTR5GTOBAAY7L3OYANT7PAFBCN
