
const ChainUtil = require('../chain-utils');

class Item {

    constructor(emoji, name, price, seller){
        this.id = ChainUtil.id();
        this.emoji = emoji;
        this.name = name;
        this.price = price;
        this.seller = seller;
        this.sold = false;
    }

    toString() {
        return `Item: ${this.emoji}
                Id: ${this.id}
                Name: ${this.name}
                Price: ${this.price}`
    }

    static genesis(){
        return new this('b30f4d00-4df7-11ef-a72f-c9828cb4724b', '🔥', 'Fire', 100, 'xmrspacebanxx', true);
    }
    



}

module.exports = Item;
