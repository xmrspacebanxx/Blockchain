#!/bin/bash

# === CONFIGURACIÓN ===
mkdir -p ~/logs
PORT=5006
DATADIR="$HOME/ETC"
GENESIS="$DATADIR/genesis.json"
SERVER_PATH="$HOME/WORLD/bedrock-server-1.26.11.1"
SERVER_EXEC="bedrock_server"

# Carpeta de logs
LOG_DIR="$HOME/logs"

# === FUNCIONES ===

# Limpieza de puertos
run_cleanPort() {
  echo "[INFO][$(date '+%H:%M:%S')] Limpiando puertos..."

  lsof -ti:19132 | xargs kill -9 2>/dev/null
#  echo "[INFO][$(date '+%H:%M:%S')] Buscando procesos en el puerto $PORT..."
  PIDS=$(lsof -t -i:$PORT | grep -v "$$")
  if [ -n "$PIDS" ]; then
#    echo "[WARN][$(date '+%H:%M:%S')] No se encontraron procesos en el puerto $PORT."
#    echo "[INFO][$(date '+%H:%M:%S')] Eliminando procesos: $PIDS"
    kill -9 $PIDS
    echo "[OK][$(date '+%H:%M:%S')] $PORT liberado"
  fi
}

# Minecraft (SIN LOOP)
run_world() {
  echo "[INFO][$(date '+%H:%M:%S')] Iniciando Mundo..."

  cd "$SERVER_PATH" || {
    echo "[ERROR][$(date '+%H:%M:%S')] No se pudo acceder a $SERVER_PATH"
    exit 1
  }

# Verificar archivo
  if [ ! -f "$SERVER_EXEC" ]; then
    echo "[ERROR][$(date '+%H:%M:%S')] No existe $SERVER_EXEC"
    exit 1
  fi

# Dar permisos
  chmod +x "$SERVER_EXEC"

  echo "[START][$(date '+%H:%M:%S')] Ejecutando Bedrock..."

  ./"$SERVER_EXEC" > "$LOG_DIR/minecraft.log" 2>&1
}

run_cleanBlockchain() {
  echo "[INFO][$(date '+%H:%M:%S')] Removiendo datos de la blockchain..."
  printf "y\ny\ny\n" | geth --datadir "$DATADIR" removedb > ~/logs/removedb.log 2>&1
  sleep 5

  echo "[INFO][$(date '+%H:%M:%S')] Inicializando génesis..."
  geth --datadir "$DATADIR" init "$GENESIS" > ~/logs/init.log 2>&1
  sleep 2

  echo "[INFO][$(date '+%H:%M:%S')] Inicializando génesis (segunda vez)..."
  geth --datadir "$DATADIR" init "$GENESIS" > ~/logs/init2.log 2>&1
  sleep 2
}

run_geth() {
  echo "[INFO][$(date '+%H:%M:%S')] Iniciando Geth..."
  nohup geth --datadir "$DATADIR" \
    --networkid 1 \
    --http --http.addr 127.0.0.1 --http.port 8545 --http.api eth,web3,net,txpool,admin \
    --http.corsdomain "*" \
    --ws --ws.addr 127.0.0.1 --ws.port 8546 --ws.api eth,web3,net,txpool,admin \
    --mine --syncmode full > ~/logs/geth.log 2>&1 &
  sleep 10

  if lsof -i :8545 > /dev/null; then
    echo "[OK][$(date '+%H:%M:%S')] Geth está escuchando en el puerto 8545"
    return 0
  else
    echo "[ERROR][$(date '+%H:%M:%S')] Geth no inició correctamente"
    tail -n 20 ~/logs/geth.log
    return 1
  fi

  # Espera adicional para asegurar que Geth termine de establecer conexiones
  echo "[WAIT][$(date '+%H:%M:%S')] Esperando 10 segundos adicionales para estabilizar Geth..."
  sleep 10
}

run_ethServer() {
  sleep 10
  while true; do
    echo "[INFO][$(date '+%H:%M:%S')] Iniciando ethServer.js..."
    node /home/xmrspacebanxx/WalletSpace/Blockchain/xmrspacebanxxserver/ethServer.js > ~/logs/ethServer.log 2>&1
    echo "[ERROR][$(date '+%H:%M:%S')] ethServer.js se cayó. Reintentando..."
    sleep 10
  done
}

run_localtunnel() {
  while true; do
    echo "[INFO][$(date '+%H:%M:%S')] Iniciando localtunnel..."
    npx localtunnel --port $PORT --subdomain ether > ~/logs/tunnel.log 2>&1
    echo "[WARN][$(date '+%H:%M:%S')] localtunnel se cayó. Reintentando en 30 segundos..."
    sleep 30
  done
}

run_saveTxpool() {
  sleep 5
  while true; do
    echo "Iniciando saveTxpool.js"
    node /home/ETHER/APP/saveTxpool.js > ~/logs/saveTxpool.log 2>&1
    echo "saveTxpool.js se cayó. Reintentando en 30s..."
    sleep 30
    done
}

run_periodic_clean_and_restart() {
  while true; do
    echo "[INFO][$(date '+%H:%M:%S')] Reinicio programado: limpiando Geth y reiniciando..."
    pkill -f "geth --datadir $DATADIR"
    sleep 5
    #run_cleanBlockchain
    run_geth
    echo "[INFO][$(date '+%H:%M:%S')] Esperando 60 minutos para el siguiente ciclo..."
    sleep 3600
  done
}

cleanup(){
  echo ""
  echo "[SHUTDOWN] Cerrando sistema..."

  kill $PID_WORLD 2>/dev/null
  kill $SPID_GETH 2>/dev/null
  kill $SPID_NODE 2>/dev/null

  exit 0
}

trap cleanup SIGINT SIGTERM

monitor() {
  while true; do
    if ! kill -0 $PID_WORLD 2>/dev/null; then
      echo "[RESTART] Minecraft cayó, reiniciando..."
      run_world &
      PID_WORLD=$!
    fi
    sleep 5
  done
}

# === INICIO GENERAL ===

echo "[BOOT][$(date '+%H:%M:%S')] Iniciando servicios..."
run_cleanPort
#run_cleanBlockchain
#run_geth || { echo "[FATAL] Geth falló. Abortando."; exit 1; }

run_world &
PID_WORLD=$!
sleep 60

run_geth &
PID_GETH=$!
sleep 5

echo "[BOOT][$(date '+%H:%M:%S')] Lanzando servicios secundarios..."
sleep 15
run_periodic_clean_and_restart &
PID_CLEAN=$!
sleep 15
#run_ethServer &
#sleep 15
#run_localtunnel &
#sleep 15
#run_saveTxpool &

echo "[SYSTEM][$(date '+%H:%M:%S')] Servicios activos:"
echo "[SYSTEM][$(date '+%H:%M:%S')] Minecraft PID: $PID_WORLD"
echo "[SYSTEM][$(date '+%H:%M:%S')] Geth PID: $PID_GETH"

#monitor &
wait $PID_WORLD $PID_GETH

