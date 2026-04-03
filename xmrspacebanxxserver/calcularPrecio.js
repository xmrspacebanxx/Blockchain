const API_KEY = "UMPBTGKSZYW98JFKGUT15YASM33SW2SIAI";
const INTERVAL = 3 * 60 * 1000;

async function obtenerPrecioETH() {
  try {
    const url = new URL("https://api.etherscan.io/v2/api");

    url.searchParams.set("module", "stats");
    url.searchParams.set("action", "ethprice");
    url.searchParams.set("chainid", "1"); // Ethereum Mainnet

    const response = await fetch(url.toString(), {
      headers: {
        "X-API-Key": API_KEY
      }
    });

    const data = await response.json();
    console.log("Respuesta cruda Etherscan V2:", data);

    if (data.status !== "1") {
      throw new Error(data.result || data.message || "NOTOK");
    }

    const precioUSD = Number(data.result.ethusd);
    const precioBTC = Number(data.result.ethbtc);

    console.log(
      `[${new Date().toLocaleTimeString()}] ETH: $${precioUSD} USD | ${precioBTC} BTC`
    );

  } catch (error) {
    console.error("Error obteniendo precio ETH:", error.message);
  }
}

obtenerPrecioETH();
setInterval(obtenerPrecioETH, INTERVAL);


