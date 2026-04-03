import fetch from 'node-fetch';

/*//
const API_KEY = 'KHHADFL6Y4CDX39M'; // Reemplaza con tu API Key de Alpha Vantage
const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${API_KEY}`;


async function fetchData() {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fetchData();
*/

class Cryptocurrency {
    constructor(name, symbol, totalSupply, algorithm, decimals) {
        this.name = name;
        this.symbol = symbol;
        this.totalSupply = totalSupply;
        this.algorithm = algorithm;
        this.decimals = decimals;
    }

    async getPrice(currency = 'USD') {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${this.name.toLowerCase()}&vs_currencies=${currency}`);
            const data = await response.json();
            return data[this.name.toLowerCase()][currency.toLowerCase()];
        } catch (error) {
            console.error("Error obteniendo el precio:", error);
            return null;
        }
    }

    describe() {
        return `
        Nombre: ${this.name}
        Símbolo: ${this.symbol}
        Suministro Total: ${this.totalSupply.toLocaleString()} ${this.symbol}
        Algoritmo: ${this.algorithm}
        Decimales: ${this.decimals}
        `;
    }
}

module.exports = Cryptocurrency;

// Ejemplo de uso
const myCrypto = new Cryptocurrency('bitcoin', 'BTC', 21000000, 'SHA-256', 8);

console.log(myCrypto.describe());

myCrypto.getPrice().then(price => {
    console.log(`Precio actual de ${myCrypto.symbol}: $${price} USD`);
});

