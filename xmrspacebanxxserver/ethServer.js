const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const http = require("http");

const app = express();

app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:8545",
    changeOrigin: true,
    ws: true,
  })
);

// CORS fix
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const server = http.createServer(app);

server.listen(5006, () => {
  console.log("🚀 Servidor proxy corriendo en http://localhost:5006");
});










// geth -datadir ~/DOLLAR removedb
// nano genesis.json
// geth --datadir ~/DOLLAR init ~/DOLLAR/genesis.json
// geth attach http://localhost:8545

//0x711d08aa01892B850c78f5a732a0FB4f8DC0f4a4
//57 ethereum

//0x344DaC2d8Cad910cd04B8bDc7874F5dA12606Eda
//0x8abb5a589ae6dc1944be1815efb7f8216c68cf69


/* patch, enrich, fortune, teach, scatter, sleep,
melt, minute, exchange, worth, point, flower

*/

/* measure, retreat, scorpion, sad, boss, grass, legal, nest, sentence, garlic,
  entire, intact
*/

/* gallery, floor, alter, arrive, practice, mouse, about, 
  market, scissors, grow, segment, drum
  */
 

  