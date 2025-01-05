
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const { v1: uuidv1 } = require('uuid');

class ChainUtil{
	
	static genKeyPair(){
		try {
			return ec.genKeyPair();
		} catch (error) {
			return null;
		}
	}

	static id(){
		try {
			return uuidv1();
		} catch (error) {
			return null;
		}
	}

	static hash(data){
		try {
			return SHA256(JSON.stringify(data)).toString();
		} catch (error) {
			return null;
		}
	}

	static verifySignature(publicKey, signature, dataHash){
		try {
			return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
		} catch (error) {
			return null;
		}
	}

	static restoreKeyPair(privateKeyHex){
		try {
			return ec.keyFromPrivate(privateKeyHex, 'hex');
		} catch (error) {
			return null;
		}
	}
}

module.exports = ChainUtil;
