
const fs = require('fs');
const wallet = require('./index');

class walletManager{
    constructor(){
        this.wallets = this.loadWallets() || [] ;
    }

    newWallet(){
        const newWallet = new wallet();
        this.wallets.push(newWallet);
        this.saveWallet();
        return newWallet;
    }

    listWallets() {
        return this.wallets;
    }

    saveWallet(){
        // Convertir objeto JavaScript a JSON y escribirlo en un archivo
            fs.writeFile('wallets.json', JSON.stringify(this.wallets, null, 2), (err) => {
            });
    }

    loadWallets() {
        if (fs.existsSync('wallets.json')) {
            const wallets = fs.readFileSync('wallets.json');
            return JSON.parse(wallets);
        }
        return null;
    }
}

module.exports = walletManager;