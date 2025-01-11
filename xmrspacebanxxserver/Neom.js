const crypto = require("crypto");
const readline = require("readline");

// Utilidad para colorear texto
const colors = {
  reset: "\x1b[0m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

// Configuración de readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Generar clave privada y dirección pública
function generateKeys() {
  const privateKey = crypto.randomBytes(32).toString("hex");
  const publicKey = crypto.createECDH("secp256k1");
  publicKey.setPrivateKey(privateKey, "hex");
  const address = publicKey.getPublicKey("hex");
  return { privateKey, address };
}

// Datos iniciales de la wallet
const { privateKey, address } = generateKeys();
let balanceBTC = 1.0; // Balance inicial ficticio
let transactionHistory = [];

// Dibujar el banner principal
function drawBanner() {
  console.log(colors.yellow + `
  ██████╗ ██╗████████╗ ██████╗ ██████╗ ██╗███╗   ██╗
 ██╔═══██╗██║╚══██╔══╝██╔═══██╗██╔══██╗██║████╗  ██║
 ██║   ██║██║   ██║   ██║   ██║██████╔╝██║██╔██╗ ██║
 ██║   ██║██║   ██║   ██║   ██║██╔═══╝ ██║██║╚██╗██║
 ╚██████╔╝██║   ██║   ╚██████╔╝██║     ██║██║ ╚████║
  ╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝
  ` + colors.reset);
  console.log(colors.cyan + `
╔════════════════════════════════════════════════════════════════════════╗
║ 🚀 Bienvenido a Blockchain Wallet - Gestiona tus Bitcoin               ║
║ Dirección de tu wallet: ${address.substring(0, 12)}...                 ║
╚════════════════════════════════════════════════════════════════════════╝
  ` + colors.reset);
}

// Dibujar menú principal
function drawMenu() {
  console.log(colors.green + `
  ╔═════════════════════════════════════════════╗
  ║ 1. ✉️  Enviar Bitcoin                       ║
  ║ 2. 💰 Consultar balance de BTC              ║
  ║ 3. 📜 Ver historial de transacciones        ║
  ║ 4. 🔑 Mostrar claves de la wallet           ║
  ║ 5. 🚪 Salir                                 ║
  ╚═════════════════════════════════════════════╝
  ` + colors.reset);
}

// Función para enviar Bitcoin
function sendBitcoin() {
  rl.question(colors.yellow + "✉️  Introduce la dirección del destinatario: " + colors.reset, (recipient) => {
    rl.question(colors.yellow + "✉️  Introduce la cantidad de BTC que deseas enviar: " + colors.reset, (amount) => {
      const btcAmount = parseFloat(amount);
      if (btcAmount > balanceBTC) {
        console.log(colors.red + "❌ Fondos insuficientes. No puedes enviar más de tu saldo disponible." + colors.reset);
        promptMenu();
      } else {
        balanceBTC -= btcAmount;
        transactionHistory.push({ type: "Envío", btc: btcAmount, recipient, date: new Date().toISOString() });
        console.log(colors.green + `✅ Has enviado ${btcAmount.toFixed(8)} BTC a la dirección: ${recipient}.` + colors.reset);
        promptMenu();
      }
    });
  });
}

// Función para consultar balance
function viewBalance() {
  console.log(colors.green + `💰 Tu balance actual de BTC: ${balanceBTC.toFixed(8)} BTC.` + colors.reset);
  promptMenu();
}

// Función para ver historial de transacciones
function viewHistory() {
  if (transactionHistory.length === 0) {
    console.log(colors.yellow + "⚠️ Aún no tienes transacciones en el historial." + colors.reset);
  } else {
    console.log(colors.green + "📜 Historial de transacciones:" + colors.reset);
    transactionHistory.forEach((tx, index) => {
      console.log(`
      ${index + 1}. ${tx.type}:
         - Enviados: ${tx.btc.toFixed(8)} BTC
         - Destinatario: ${tx.recipient}
         - Fecha: ${tx.date}
      `);
    });
  }
  promptMenu();
}

// Función para mostrar las claves de la wallet
function showKeys() {
  console.log(colors.cyan + `
🔑 Claves de tu wallet:
   - Dirección pública: ${address}
   - Clave privada: ${privateKey}
⚠️  Guarda esta información en un lugar seguro. Si pierdes tu clave privada, perderás acceso a tus BTC.
  ` + colors.reset);
  promptMenu();
}

// Menú principal
function promptMenu() {
  drawMenu();
  rl.question(colors.green + "Selecciona una opción: " + colors.reset, (option) => {
    switch (option) {
      case "1":
        sendBitcoin();
        break;
      case "2":
        viewBalance();
        break;
      case "3":
        viewHistory();
        break;
      case "4":
        showKeys();
        break;
      case "5":
        console.log(colors.cyan + "👋 Gracias por usar Blockchain Wallet. ¡Hasta la próxima!" + colors.reset);
        rl.close();
        break;
      default:
        console.log(colors.red + "❌ Opción inválida. Inténtalo de nuevo." + colors.reset);
        promptMenu();
        break;
    }
  });
}

// Inicia la aplicación
drawBanner();
promptMenu();


