const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = 5006;
const GETH_RPC_URL = "http://localhost:8545";
const LOG_DIR = "./txlogs";

// Crear carpeta de logs si no existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// Métodos permitidos desde el frontend (lista blanca)
const allowedMethods = [
  "eth_blockNumber",
  "eth_getBalance",
  "eth_getTransactionByHash",
  "eth_sendTransaction",
  "eth_call",
  "eth_getTransactionCount",
  "eth_getCode",
  "eth_gasPrice",
  "eth_estimateGas",
  "eth_chainId",
  "web3_clientVersion",
  "net_version",
  "txpool_content"
];

app.use(cors({ origin: "*" }));
app.use(express.json());

/**
 * Middleware para validar el método y guardar si es transacción
 */
app.post("/", async (req, res, next) => {
  const { method, params } = req.body;

  if (!allowedMethods.includes(method)) {
    return res.status(403).json({ error: "Método no permitido." });
  }

  // Guardar las transacciones entrantes
  if (method === "eth_sendTransaction" && params && params.length > 0) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `tx-${timestamp}.json`;
    const filepath = path.join(LOG_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(params, null, 2));
    console.log(`Transacción guardada: ${filename}`);
  }

  next();
});

/**
 * Proxy a Geth
 */
app.use(
  "/",
  createProxyMiddleware({
    target: GETH_RPC_URL,
    changeOrigin: true,
    ws: true
  })
);

/**
 * Endpoint opcional para leer las transacciones guardadas
 */
app.get("/txlogs", (req, res) => {
  const files = fs.readdirSync(LOG_DIR);
  const logs = files.map(file => ({
    file,
    content: JSON.parse(fs.readFileSync(path.join(LOG_DIR, file)))
  }));
  res.json(logs);
});

app.listen(PORT, () => {
  console.log(`Servidor proxy escuchando en http://localhost:${PORT}`);
});
