
const fs = require('fs');
const path = require('path');
const Wallet = require('./index');

class WalletManager{
    constructor(){
        this.wallets = [] ;
    }

    newWallet(){
        const newWallet = new Wallet();
        this.wallets.push(newWallet);
        this.saveWallet(newWallet);
        return newWallet;
    }

    listWallets() {
        return this.wallets;
    }

	static fromJSON(data){
		const wallets = new WalletManager();
		return wallets;
	}

    saveWallet(wallet) {
        const directory = path.join(__dirname, '../../Backup')
    	const filePath = path.join(directory, 'wallets.json');
    	let existingWallets = [];
	    if (fs.existsSync(filePath)) {
    	    const data = fs.readFileSync(filePath);
    	    existingWallets = JSON.parse(data);
    	}
        if (!Array.isArray(existingWallets)) {
            console.error('Wallets data is not an array, initializing with empty array.');
            existingWallets = [];
        }
	    existingWallets.push(wallet.toJSON());
		fs.writeFileSync(filePath, JSON.stringify(existingWallets, null, 2));
		console.log('Wallet saved successfully!');
    }

    static loadWallets() {
        const filePath = path.join(__dirname, '../../Backup/wallets.json');
	    const walletManager = new WalletManager();
    	if (fs.existsSync(filePath)) {
        	const data = fs.readFileSync(filePath);
        	let walletsData;
        try {
            walletsData = JSON.parse(data);
            if (!Array.isArray(walletsData)) {
                throw new Error("Data is not an array");
            }
        } catch (error) {
            console.error("Failed to load wallets:", error);
            walletsData = [];
        }
        walletsData.forEach(walletData => {
            const wallet = Wallet.fromJSON(walletData);
            walletManager.wallets.push(wallet);
        });
        console.log('Loaded wallets from file...');
    } else {
        console.log('No existing wallets found.');
    }

    return walletManager;

    }

}

module.exports = WalletManager;
