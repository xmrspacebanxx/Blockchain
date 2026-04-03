// tunnel.js
const { exec } = require("child_process");

function startTunnel() {
  const command = "npx localtunnel --port 5006 --subdomain=etherscan";
  const tunnel = exec(command);

  tunnel.stdout.on("data", (data) => {
    console.log(`Tunnel: ${data}`);
  });

  tunnel.stderr.on("data", (data) => {
    console.error(`Tunnel Error: ${data}`);
  });

  tunnel.on("close", (code) => {
    console.log(`Tunnel closed with code ${code}. Reiniciando en 15 segundos...`);
    setTimeout(startTunnel, 10000);
  });
}

startTunnel();
