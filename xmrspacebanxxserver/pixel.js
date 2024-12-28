const readline = require("readline");
const chalk = require("chalk");

function drawBanner() {
  console.log(chalk.green(`

 ████ ████████████████████████████████████████████████████████   
   
   ╔═█═█══╗
  ███████║   ██╗  ██████╗  ██████╗  ██████╗  ██╗  ██████╗  ██╗
    ██╗  █║  ██║    ██╔═╝  ██╔═══╝  ██╔═██║  ██║  ██████║  ██║
    █████║   ██║    ██║    ██║      ██║ ██║  ██║  ██║ ██║  ██║
    ██╚═╗█║  ██║    ██║    ██║      ██║ ██║  ██║  ██║ ██║    ║
  ███████║   ██║    ██║    ██████╗  ██████║  ██║  ██║ ██║  ██║
     █ █╚═╝  ╚═╝    ╚═╝    ╚═════╝  ╚═════╝  ╚═╝  ╚═╝ ╚═╝  ╚═╝

    ██████╗  ██████╗  ██████╗  ██████╗      ██╗     ██████╗
    ██╔═══╝  ██╔═██║  ██║ ██║  ██╔═══╝      ██║       ██╔═╝
    ██║      ██║ ██║  ██████║  ████    ██╗  ██║       ██║
    ██║      ██║ ██║  ██║ ██║  ██║     ╚═╝  ██║       ██║
    ██████╗  ██████║  ██║ ██║  ██████╗      ██████╗   ██║  ██╗
    ╚═════╝  ╚═════╝  ╚═╝ ╚═╝  ╚═════╝      ╚═════╝   ╚═╝  ╚═╝

 █ █ █ █ █ █ █ █ █ █ █ █
  █ █

`));

  console.log(chalk.yellow(`
-------------------------------------------------------------------------------------
|                                                                                   |
|                     ${chalk.cyan("💾 WELCOME TO THE CYBER-VAULT 💾")}                      |
|                                                                                   |
-------------------------------------------------------------------------------------
  `));
}

function drawMenu() {
  console.log(chalk.yellow(`
  ╔═════════════════════════════════════════════════════╗
  ║ ${chalk.cyan("1. 🔑 Generar par de claves (desde contraseña)         ")} ║
  ║ ${chalk.cyan("2. 💰 Consultar balance                               ")} ║
  ║ ${chalk.cyan("3. 📤 Enviar monedas                                 ")} ║
  ║ ${chalk.cyan("4. 📜 Ver historial de bloques                       ")} ║
  ║ ${chalk.cyan("5. 🚪 Salir                                         ")} ║
  ╚═════════════════════════════════════════════════════╝
  `));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function startApp() {
  drawBanner();
  drawMenu();

  rl.question(chalk.green("Selecciona una opción: "), (option) => {
    switch (option) {
      case "1":
        console.log(chalk.magenta("🔑 Generando par de claves..."));
        break;
      case "2":
        console.log(chalk.magenta("💰 Consultando balance..."));
        break;
      case "3":
        console.log(chalk.magenta("📤 Enviando monedas..."));
        break;
      case "4":
        console.log(chalk.magenta("📜 Mostrando historial de bloques..."));
        break;
      case "5":
        console.log(chalk.cyan("👋 Saliendo..."));
        rl.close();
        return;
      default:
        console.log(chalk.red("❌ Opción inválida. Inténtalo de nuevo."));
    }

    setTimeout(() => {
      drawMenu();
      startApp();
    }, 1500);
  });
}

startApp();
