
async function getAddress(publicKey, length=6) {
    const encoder = new TextEncoder();
    const data = encoder.encode(publicKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const characters = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '';
    for (let i = 0; i < length; i++) {
        address += characters[hashArray[i] % characters.length];
    }
    return address;
}

try {
    const address = await getAddress(publicKey);
    res.json(address);
} catch (error) {
    res.status(500).json({error: error.message});
}