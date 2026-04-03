function calcularCostoTransaccion(txn) {
    const sender = Object.keys(txn.queued)[0]; // Obtener la dirección del remitente
    const nonce = Object.keys(txn.queued[sender])[0]; // Obtener el nonce
    
    const [receiver, detalles] = Object.entries(txn.queued[sender][nonce])[0];
    
    // Extraer la cantidad de wei y el gas
    const match = detalles.match(/(\d+) wei \+ (\d+) gas × (\d+) wei/);
    if (!match) {
        throw new Error("Formato de transacción no válido");
    }
    
    const cantidadWei = BigInt(match[1]);
    const gasLimite = BigInt(match[2]);
    const gasPrecioWei = BigInt(match[3]);
    
    const costoGas = gasLimite * gasPrecioWei;
    const costoTotal = cantidadWei + costoGas;
    
    return {
        remitente: sender,
        nonce: Number(nonce),
        destinatario: receiver,
        cantidadETH: Number(cantidadWei) / 10 ** 18,
        costoGasETH: Number(costoGas) / 10 ** 18,
        costoTotalETH: Number(costoTotal) / 10 ** 18
    };
}

// Ejemplo de uso
const transaccion = {
    queued: {
        "0x881D40237659C251811CEC9c364ef91dC08D300C": {
            1: {
                "0x881D40237659C251811CEC9c364ef91dC08D300C": "500000000000000000 wei + 21000 gas × 1000000 wei"
            },
            2: {
                "0x165D5428b28B176d9014048849D10B1484df240C": "1893440000000000000 wei + 21000 gas × 1000000 wei"
            }
        }
    }
};

const resultado = calcularCostoTransaccion(transaccion);
console.log(resultado);
