//Aplicacion para leer bloques en ethereum y calcular la cantidad de bitcoins
const Web3 = require('web3');
const axios = require('axios');

// Configurar la conexión a un nodo de Ethereum (puede ser Infura, Alchemy, etc.)
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'));

// Función para obtener el precio actual de Bitcoin en USD
async function getBitcoinPrice() {
    try {
        const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice/BTC.json');
        return response.data.bpi.USD.rate_float;
    } catch (error) {
        console.error('Error al obtener el precio de Bitcoin:', error);
        return null;
    }
}

// Función para leer bloques de Ethereum y calcular la cantidad de bitcoins
async function readEthereumBlocksAndCalculateBTC(startBlock, endBlock) {
    const bitcoinPrice = await getBitcoinPrice();
    if (!bitcoinPrice) {
        console.log('No se pudo obtener el precio de Bitcoin. Abortando operación.');
        return;
    }

    for (let i = startBlock; i <= endBlock; i++) {
        try {
            const block = await web3.eth.getBlock(i, true);
            if (block) {
                console.log(`Bloque #${block.number} - Hash: ${block.hash} - Transacciones: ${block.transactions.length}`);

                // Aquí puedes agregar la lógica para calcular la cantidad de bitcoins
                // basada en las transacciones del bloque de Ethereum.
                // Por ejemplo, podrías sumar los valores de las transacciones y convertirlos a BTC.

                let totalValueInETH = block.transactions.reduce((sum, tx) => sum + parseFloat(web3.utils.fromWei(tx.value, 'ether')), 0);
                let totalValueInUSD = totalValueInETH * (await web3.eth.getGasPrice() / 1e18);
                let equivalentBTC = totalValueInUSD / bitcoinPrice;

                console.log(`Valor total en ETH: ${totalValueInETH}, equivalente en BTC: ${equivalentBTC}`);
            }
        } catch (error) {
            console.error(`Error al leer el bloque #${i}:`, error);
        }
    }
}

// Llamar a la función para leer bloques desde el bloque 13000000 hasta el 13000010
readEthereumBlocksAndCalculateBTC(13000000, 13000010);

