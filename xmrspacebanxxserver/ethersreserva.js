import fs from "fs";
import fetch from "node-fetch";

// Obtener precio actual de ETH en USD
async function obtenerPrecio() {
  const url = 
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,gbp";
    const res = await fetch(url);
    const data = await res.json();
    return {
      usd: data.ethereum.usd,
      gbp: data.ethereum.gbp
    };
}

// Leer genesis.json
const genesis = JSON.parse(fs.readFileSync("./genesis.json", "utf8"));

let totalWei = 0n; // BigInt para manejar números grandes

for (const [address, { balance }] of Object.entries(genesis.alloc)) {
  // El balance puede venir en hex o decimal
  const value =
    typeof balance === "string" && balance.startsWith("0x")
      ? BigInt(balance)
      : BigInt(balance); // asume decimal si no tiene 0x
  totalWei += value;
}

// Imprimir balance total en ETH 
const totalEth = Number(totalWei) / 1e18;
console.log(`💰 Total en genesis: ${totalEth} ETH`);

// Imprimir balance total en USD || GBP
(async () => {
  const { usd, gbp } = await obtenerPrecio();
  console.log(`💵 Precio actual ETH: $${usd} USD || £${gbp} GBP `);
  console.log(`Valor total en USD: $${(totalEth * usd).toFixed(2)} USD`);
  console.log(`Valor total en GBP: £${(totalEth * gbp).toFixed(2)} GBP`);
})();

// 23811002
// 💰 Total en genesis: 663696103131.9066 ETH
// 💵 Precio actual ETH: $4505.23 USD || £3349.29 GBP 
// Valor total en USD: $2990103594712959.50 USD
// Valor total en GBP: £2222910721258663.50 GBP
// Valor total en EN BOLSA: $2945500000000000 USD
// Valor total en COP: $10000000000000000000 COP


// 33811003
// 💰 Total en genesis: 663696103131.9066 ETH
// 💵 Precio actual ETH: $4531.88 USD || £3362.68 GBP 
// Valor total en USD: $3007791095861425.00 USD
// Valor total en GBP: £2231797612079599.75 GBP

// 82121003
// 💰 Total en genesis: 6956000000 GOLD OZ
// 💵 Precio actual OZ: $3861,34
// Valor total en USD:  $3007791095861425.00 USD
// Valor total en USD:  $0026850000000000.00 USD ≈ 17.390.000lingotes ≈ 400 onzas troy ≈ 12,44 kg.
// Valor total en USD:  $0000000000251000.00 USD ≈ 162 lingotes ≈ 3 onzas troy ≈ 93,24 g.

// 00811004
// 💰 Total en genesis: 6956000000 GOLD OZ
// 💵 Precio actual OZ: $3912,10
// Valor total en USD:  $0027200000000000.00 USD ≈ 17.680.000 lingotes ≈ 400 onzas troy ≈ 12,44 kg.
// Valor total en USD:  $0000000000259000.00 USD ≈ 167 lingotes ≈ 3 onzas troy ≈ 93,24 g.

//💰 Total en genesis: 663696103131.9066 ETH
//💵 Precio actual ETH: $4568.27 USD || £3389.68 GBP 
// Valor total en USD: $3031942997054395.50 USD
// Valor total en GBP: £2249717406864161.00 GBP

// 65811005
// 💰 Total en genesis: 6956000000 GOLD OZ
// 💵 Precio actual OZ: $3940,50
// Valor total en USD:  $0027400000000000.00 USD ≈ 17.840.000 lingotes ≈ 400 onzas troy ≈ 12,44 kg.
// Valor total en USD:  $0000000000262000.00 USD ≈ 169 lingotes ≈ 3 onzas troy ≈ 93,24 g.

// 63701006
// 💰 Total en genesis: 6956000000 GOLD OZ
// 💵 Precio actual OZ: $3985,00
// Valor total en USD:  $0027700000000000.00 USD ≈ 18.080.000 lingotes ≈ 400 onzas troy ≈ 12,44 kg.
// Valor total en USD:  $0000000000268000.00 USD ≈ 173 lingotes ≈ 3 onzas troy ≈ 93,24 g.

// 💰 Total en genesis: 663696103131.9066 ETH
// 💵 Precio actual ETH: $4582.78 USD || £3411.17 GBP 
// Valor total en USD: $3041573227510839.00 USD
// Valor total en GBP: £2263980236120466.00 GBP

// 60411008
// 💰 Total en genesis: 6956000000 GOLD OZ
// 💵 Precio actual OZ: $4020,00
// Valor total en USD:  $0028000000000000.00 USD ≈ 18.320.000 lingotes ≈ 400 onzas troy ≈ 12,44 kg.
// Valor total en USD:  $0000000000274000.00 USD ≈ 177 lingotes ≈ 3 onzas troy ≈ 93,24 g.

// 34011011
// 💰 Total en genesis: 6956000000 GOLD OZ
// 💵 Precio actual OZ: $4050,00
// Valor total en USD:  $0028200000000000.00 USD ≈ 18.400.000 lingotes ≈ 400 onzas troy ≈ 12,44 kg.
// Valor total en USD:  $0000000000278000.00 USD ≈ 179 lingotes ≈ 3 onzas troy ≈ 93,24 g.

// 64711012
// 💰 Total en genesis: 6956000000 GOLD OZ
// 💵 Precio actual OZ: $4100,00
// Valor total en USD:  $0028500000000000.00 USD ≈ 18.560.000 lingotes ≈ 400 onzas troy ≈ 12,44 kg.
// Valor total en USD:  $0000000000284000.00 USD ≈ 183 lingotes ≈ 3 onzas troy ≈ 93,24 g.

// 60811015
// 💰 Total en genesis: 6956000000 GOLD OZ
// 💵 Precio actual OZ: $4150,00
// Valor total en USD:  $0028800000000000.00 USD ≈ 18.720.000 lingotes ≈ 400 onzas troy ≈ 12,44 kg.
// Valor total en USD:  $0000000000289000.00 USD ≈ 187 lingotes ≈ 3 onzas troy ≈ 93,24 g.

// 63311103
// 💰 Total en genesis: 6956000000 GOLD OZ
// 💵 Precio actual OZ: $4200,00
// Valor total en USD:  $0029100000000000.00 USD ≈ 18.880.000 lingotes ≈ 400 onzas troy ≈ 12,44 kg.
// Valor total en USD:  $0000000000295000.00 USD ≈ 191 lingotes ≈ 3 onzas troy ≈ 93,24 g.
// Retiro USDCE:        $0000866183000000.00 USD ≈ 206.234.047 lingotes ≈ 12 onzas troy ≈ 2,557,302.18 Tn.