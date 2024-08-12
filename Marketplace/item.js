
const ChainUtil = require('../chain-utils');

class Item {

    constructor(emoji, name, amount, seller){
        this.id = ChainUtil.id();
        this.emoji = emoji;
        this.name = name;
        this.amount = amount;
        this.seller = seller;
        this.full = false;
    }

    toString() {
        return `Item: ${this.emoji}
                Id: ${this.id}
                Name: ${this.name}
                Amount: ${this.amount}`
    }

    static genesis(){
        return new this('🪨', 'Rock', 120, '04b0638a1354d684d7f29fe37991fbfbfac90f61edb032fa1fdd2efd21f6fdfa3e62bf48e3d82e4b69d67d5cd586dd7429251e132c98a5823df58f9711839cd71c', false);
    }

}

module.exports = Item;
