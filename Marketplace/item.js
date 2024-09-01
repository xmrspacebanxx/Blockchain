
const ChainUtil = require('../chain-utils');

class Item{
	constructor(emoji, name, amount, seller){
		this.id = ChainUtil.id();
		this.emoji = emoji;
		this.name = name;
		this.amount = amount;
		this.seller = seller;
		this.full = false;
	}

	toString(){
		return `Item: ${this.emoji}
				Id: ${this.id}
				Name: ${this.name}
				Amount: ${this.amount}`
	}

    static guadeloupe(){
        return new this('🪨', 'Guadeloupe', 318, '043003e9ea976ab0574c33186304212d7ce1847474702d2af97becf9943265b78287ce66797f5fa64b70ce8d6f4daff45b0fb3f3ad1028a85260ce48010a98a8e3', false);
    }

}

module.exports = Item;




