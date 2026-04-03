const url = 'https://api.etherscan.io/v2/api?apikey=UMPBTGKSZYW98JFKGUT15YASM33SW2SIAI&chainid=1&module=account&action=tokennfttx&address=0x37C3DFd320EBA72A7Bb7b0B760D9d010B8A4Bf75&tag=latest&blockno=8000000&startblock=0&endblock=9999999999&page=1&offset=1&sort=desc&contractaddress=0x37C3DFd320EBA72A7Bb7b0B760D9d010B8A4Bf75';
const options = {method: 'GET', body: undefined};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}