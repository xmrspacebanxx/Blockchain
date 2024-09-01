
const Item = require('./item');
const Wallet = require('../Wallet/index');

class StorePool{
	constructor(){
		this.items = [Item.guadeloupe()];
		this.marketPlace = [];
	}

	addItem(emoji, name, price, seller){
		const item = new Item(emoji, name, price, seller);
		this.items.push(item);
		return item;
	}

	addItemMarketPlace(emoji, name, price, seller){
		const marketPlace = new Item(emoji, name, price, seller);
		this.marketPlace.push(marketPlace);
		return marketPlace;
	}

	getItems(){
		return this.items;
	}

	getMarketPlace(){
		return this.marketPlace;
	}

	buyMarketPlace(id, amount, wallet, bc, tp, p2pServer){
		const item = this.marketPlace.find(p => p.id === id);
		if(!item){
			throw new Error('Item not found');
		}
		const transaction = wallet.createTransaction(item.seller, item.price, bc, tp);
		if(transaction){
			p2pServer.broadcastTransaction(transaction);
			return { status: 'Item purchased',  item };
		} else{
			throw new Error('Transaction failed');
		}
	}

	replaceMarketPlace(newMarketPlace){
		if(newMarketPlace.length <= this.marketPlace.length){
			console.log('Received store is not longer than current store');
			return;
		}
		console.log('Replacing the market place...');
		this.marketPlace = newMarketPlace;
	}

}

module.exports = StorePool;




