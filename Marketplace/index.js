
const Item = require('./item');

class StorePool {

    constructor(){
        this.items = [Item.genesis()];
    }

    addItem( emoji, name, price, seller){
        const item = new Item( emoji, name, price, seller);
        this.items.push(item);
        return item;
    }

    getItems(){
        return this.items;
    }

    buyItem(id, amount, wallet, bc, tp, p2pServer) {
        const item = this.items.find(p => p.id === id);
        if (!item) {
            throw new Error('Item not found');
        }
        const transaction = wallet.createTransaction(item.seller, item.price, bc, tp);
        if (transaction) {
            p2pServer.broadcastTransaction(transaction);
            return { status: 'Item purchased', item };
        } else {
            throw new Error('Transaction failed');
        }
    }

    updateItem(){
        const item = this.items.find(p => p.id === id);
    }

    isValidItems(items){
        if(JSON.stringify(items[0]) !== JSON.stringify(Item.genesis())){
            return false;
        }
        for(let i=1; i < items.length; i++){
            
        }
    }

    replaceItems(newItems){
        if(newItems.length <= this.items.length){
            console.log('Received store is not longer than current store');
            return;
        } else if(this.isValidItems(newItems)){
            console.log('the received store is not valid');
        }
        console.log('Replacing the received store...');
        this.items = newItems;
    }

}

module.exports = StorePool;