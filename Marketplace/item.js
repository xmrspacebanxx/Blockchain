
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

    



}

module.exports = Item;
