#!/bin/bash

# Crear carpeta de logs
mkdir -p ~/logs

# Puerto a liberar
PORT=5006

echo "Buscando procesos en el puerto $PORT..."
PIDS=$(lsof -t -i:$PORT)

if [ -z "$PIDS" ]; then
  echo "No se encontraron procesos en el puerto $PORT."
else
  echo "Procesos encontrados en el puerto $PORT: $PIDS"
  echo "Eliminando procesos: $PIDS"
  kill -9 $PIDS
  echo "Procesos eliminados."
fi

# Remover datos de la blockchain
echo "Removiendo datos de la blockchain..."
nohup sh -c 'printf "y\ny\ny\ny\n" | geth --datadir ~/ETC removedb' > ~/logs/removedb.log 2>&1 &

# Esperar a que se limpien los datos
sleep 10

# Iniciar el bloque genesis
echo "Iniciando bloque genesis..."
nohup geth --datadir ~/ETH init ~/ETH/genesis2.json \
  > ~/logs/init.log 2>&1 &

# Esperar a que se inicie el bloque genesis
sleep 10

# Iniciar el bloque genesis por segunda vez
echo "Iniciando bloque genesis por segunda vez..."
nohup geth --datadir ~/ETH init ~/ETH/genesis.json \
  > ~/logs/init2.log 2>&1 &

# Esperar a que se inicie el bloque genesis por segunda vez
sleep 10

# Iniciar Geth
echo "Iniciando Geth..."
nohup geth --datadir ~/ETH \
  --networkid 1 \
  --http --http.addr 127.0.0.1 --http.port 8545 --http.api eth,web3,net,txpool,admin \
  --http.corsdomain "*" \
  --ws --ws.addr 127.0.0.1 --ws.port 8546 --ws.api eth,web3,net,txpool,admin \
  --mine --syncmode full \
  > ~/logs/geth.log 2>&1 &


# Esperar a Geth
sleep 10

# Función para ejectuar y reiniciar ethServer.js
run_ethServer() {
	while true; do
		echo "Iniciando ethServer.js"
		node /home/xmrspacebanxx/WalletSpace/Blockchain/xmrspacebanxxserver/ethServer.js > ~/logs/ethServer.log 2>&1
		echo "ethServer.js se cayó. Reintentando en 60 segundos..."
		sleep 60
  	done
}

# Función para ejecutar y reiniciar localtunnel (en primer plano, sin &)
run_localtunnel() {
  while true; do
    echo "Iniciando dollar.loca.lt"
    npx localtunnel --port 5006 --subdomain dollar > ~/logs/tunnel.log 2>&1
    echo "El túnel se cayó. Reintentando en 30 segundos..."
    sleep 30
  done
}

# Ejecutar ethServer.js en primer plano
#run_ethServer &

# Ejecutar localtunnel en primer plano
#run_localtunnel &

# Esperar a que terminen ls procesos
wait


