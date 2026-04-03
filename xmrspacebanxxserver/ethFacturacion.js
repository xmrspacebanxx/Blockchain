const { ethers } = require("ethers");

// Convertir ETH a Wei
function ethToWei(ethAmount) {
  return ethers.utils.parseEther(ethAmount.toString()).toString();
}

// Convertir Wei a ETH
function weiToEth(weiAmount) {
  return ethers.utils.formatEther(weiAmount.toString());
}

// Recibo tipo consola
function printReceipt({ ethAmount, weiAmount }) {
  const now = new Date();
  const dateStr = now.toLocaleString();

  console.log("=".repeat(40));
  console.log("         BLOCKCHAIN PAYMENT RECEIPT");
  console.log("=".repeat(40));
  console.log(`🧾 Fecha: ${dateStr}`);
  console.log(`💱 ETH enviado:     ${ethAmount} ETH`);
  console.log(`🔢 Equivalente:     ${weiAmount} Wei`);
  console.log("-".repeat(40));
  console.log("✅ Transacción simulada correctamente.");
  console.log("Gracias por usar nuestra pasarela Web3.");
  console.log("=".repeat(40));
}

// Valor de ejemplo
const eth = "66000000";
const wei = ethToWei(eth);

// Mostrar recibo
printReceipt({ ethAmount: eth, weiAmount: wei });
